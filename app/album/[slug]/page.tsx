'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Album {
    id: string
    name: string
    is_public: boolean
    slug: string
}

export default function AlbumPage() {
    const params = useParams<{ slug: string }>()
    const supabase = createClient()
    const [album, setAlbum] = useState<Album | null>(null)
    const [images, setImages] = useState<string[]>([])
    const [isUpdating, setIsUpdating] = useState(false)

    const fetchAlbum = async () => {  // TO DO: use an api route
        const { data: userData } = await supabase.auth.getUser()
        const user = userData.user

        const { data: albumData } = await supabase
            .from('albums')
            .select('id, name, slug, is_public')
            .eq('slug', params.slug)
            .eq('user_id', user?.id)
            .maybeSingle()

        if (!albumData) return

        setAlbum(albumData)

        const { data: imageRows } = await supabase
            .from('images')
            .select('image_url')
            .eq('album_id', albumData.id)
            .order('created_at', { ascending: true })

        const signed = await Promise.all(
            (imageRows ?? []).map(async (img) => {
                const { data } = await supabase.storage
                    .from('image-bucket')
                    .createSignedUrl(img.image_url, 60 * 60 * 24 * 365)

                return data?.signedUrl ?? null
            })
        )

        setImages(signed.filter(Boolean) as string[])
    }

    useEffect(() => {
        fetchAlbum()
    }, [])

    const togglePrivacy = async () => {
        if (!album) return
        setIsUpdating(true)

        try {
            const res = await fetch(`/api/albums/${album.id}/privacy`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_public: !album.is_public }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Failed to update album privacy')
            }

            setAlbum(result.album)
            toast.success(`Album is now ${result.album.is_public ? 'public' : 'private'}`)
        } catch (err: any) {
            toast.error(err.message || 'Failed to update album privacy')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleShare = async () => {
        if (!album) return

        // If the album is private, update it to public first
        if (!album.is_public) {
            setIsUpdating(true)

            try {
                const res = await fetch(`/api/albums/${album.id}/privacy`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_public: true }),
                })

                const result = await res.json()

                if (!res.ok) {
                    throw new Error(result.error || 'Failed to make album public')
                }

                setAlbum(result.album)
                toast.success('Album is now public')
            } catch (err: any) {
                toast.error(err.message || 'Privacy update failed')
                setIsUpdating(false)
                return
            }

            setIsUpdating(false)
        }

        // Now that it's public, copy the shareable URL
        const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/album/${album.slug}`
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
    }

    return (
        <div className="p-6 relative max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{album?.name}</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {album?.is_public ? 'Public' : 'Private'}
                        </span>
                        <Switch
                            checked={album?.is_public}
                            disabled={isUpdating}
                            onCheckedChange={togglePrivacy}
                        />
                    </div>
                    <Button onClick={handleShare}>Share Album</Button>
                </div>
            </div>

            {images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((url, i) => (
                        <div key={i} className="relative aspect-video bg-muted rounded overflow-hidden">
                            <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" unoptimized />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground mt-6">No images in this album.</p>
            )}
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlbumPreviewCard } from '@/components/album-preview-card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Album {
    id: string
    name: string
    slug: string
    description?: string
    coverImageUrl?: string
}

export function PhotoUploadForm() {
    const [albums, setAlbums] = useState<Album[]>([])
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
    const [newAlbumName, setNewAlbumName] = useState('')
    const [files, setFiles] = useState<FileList | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const res = await fetch('/api/albums/user')
                const data = await res.json()

                if (!res.ok) throw new Error(data.error)

                setAlbums(data.albums ?? []) // fallback to empty array
            } catch {
                setError('Failed to load albums')
                setAlbums([]) // ensure `albums` is defined
            } finally {
                setIsLoadingAlbums(false)
            }
        }


        fetchAlbums()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (!newAlbumName && !selectedAlbumId) {
            setError('Please select or create an album.')
            setIsLoading(false)
            return
        }

        const formData = new FormData()
        formData.append('albumName', newAlbumName || '')
        formData.append('albumId', selectedAlbumId || '')
        if (files) {
            Array.from(files).forEach((file) => formData.append('files', file))
        }

        try {
            const res = await fetch('/api/albums', {
                method: 'POST',
                body: formData,
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            router.push(`/album/${result.slug}`)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top: Album Selector */}
            <div className="overflow-x-auto flex gap-4 pb-2 min-h-[220px]">
                {isLoadingAlbums ? (
                    <div className="text-sm text-muted-foreground">Loading albums...</div>
                ) : albums.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">
                        No albums yet. You can create one below.
                    </div>
                ) : (
                    albums.map((album) => (
                        <div
                            key={album.id}
                            className={`min-w-[200px] cursor-pointer transition-transform duration-200 ${selectedAlbumId === album.id ? 'scale-[1.03] ring-2 ring-blue-600 rounded' : ''
                                }`}
                            onClick={() => {
                                setSelectedAlbumId(album.id)
                                setNewAlbumName(album.name)
                            }}
                        >
                            <AlbumPreviewCard
                                slug={album.slug}
                                name={album.name}
                                description={album.description}
                                thumbnailUrl={album.coverImageUrl}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Middle: Create New Album */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="new-album">Or create a new album</Label>
                <Input
                    id="new-album"
                    type="text"
                    placeholder="e.g. Graduation 2025"
                    value={newAlbumName}
                    onChange={(e) => {
                        setNewAlbumName(e.target.value)
                        setSelectedAlbumId(null)
                    }}
                />
            </div>

            {/* Bottom: Upload Photos */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="photos">Choose images</Label>
                <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    required
                    onChange={(e) => setFiles(e.target.files)}
                />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Upload Photos'}
            </Button>
        </form>
    )
}

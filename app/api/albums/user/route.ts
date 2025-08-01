import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get albums for the user
    const { data: albums, error: albumsError } = await supabase
        .from('albums')
        .select('id, name, slug, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (albumsError || !albums) {
        return NextResponse.json(
            { error: albumsError?.message || 'Failed to load albums' },
            { status: 500 }
        )
    }

    // For each album, fetch the first image and create signed URL
    const albumsWithCovers = await Promise.all(
        albums.map(async (album) => {
            let coverImageUrl: string | null = null

            const { data: image } = await supabase
                .from('images')
                .select('image_url')
                .eq('album_id', album.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle()

            if (image?.image_url) {
                const { data: signedUrlData, error: signedUrlError } =
                    await supabase.storage
                        .from('image-bucket')
                        .createSignedUrl(image.image_url, 60)

                if (signedUrlError) {
                    console.error('Signed URL error:', signedUrlError.message, signedUrlError)
                }

                if (signedUrlData?.signedUrl && !signedUrlError) {
                    coverImageUrl = signedUrlData.signedUrl
                }
            }


            return {
                ...album,
                coverImageUrl,
            }
        })
    )

    return NextResponse.json({ albums: albumsWithCovers })
}

// import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase/server'

// export async function GET(req: NextRequest) {
//   const supabase = await createClient()

//   const {
//     data: { user },
//     error: authError,
//   } = await supabase.auth.getUser()

//   if (authError || !user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   const { data: albums, error } = await supabase
//     .from('albums')
//     .select('id, name, slug, description')
//     .eq('user_id', user.id)
//     .order('created_at', { ascending: false })

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }

//   return NextResponse.json({ albums })
// }


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

  // Fetch user's albums
  const { data: albums, error } = await supabase
    .from('albums')
    .select('id, name, slug, description')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !albums) {
    return NextResponse.json({ error: error?.message || 'Failed to load albums' }, { status: 500 })
  }

  // For each album, get the first image (to use as a cover)
  const albumsWithCovers = await Promise.all(
    albums.map(async (album) => {
      const { data: image } = await supabase
        .from('images')
        .select('image_url')
        .eq('album_id', album.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      const imagePath = image?.image_url ?? null
      const coverImageUrl = imagePath
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/image-bucket/${imagePath}`
        : null

      return {
        ...album,
        coverImageUrl,
      }
    })
  )

  return NextResponse.json({ albums: albumsWithCovers })
}



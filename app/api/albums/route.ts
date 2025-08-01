import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import slugify from 'slugify'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const formData = await req.formData()

  const albumName = formData.get('albumName') as string
  const albumId = formData.get('albumId') as string | null
  const files = formData.getAll('files') as File[]

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let album

  // 👇 If user selected an existing album
  if (albumId) {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Album not found or unauthorized' }, { status: 404 })
    }

    album = data
  } else {
    // 👇 User is creating a new album
    const slug = slugify(albumName, { lower: true, strict: true })

    const { data, error } = await supabase
      .from('albums')
      .insert([{ name: albumName, slug, user_id: user.id }])
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to create album' }, { status: 500 })
    }

    album = data
  }

  // 👇 Upload images to storage + DB
  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`
    const path = `${album.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('image-bucket')
      .upload(path, file)

    if (uploadError) {
      console.error('Upload failed:', uploadError.message)
      continue
    }

    const { error: imageInsertError } = await supabase
      .from('images')
      .insert([{ album_id: album.id, image_url: path }])

    if (imageInsertError) {
      console.error('Image DB insert failed:', imageInsertError.message)
    }
  }

  return NextResponse.json({ slug: album.slug })
}

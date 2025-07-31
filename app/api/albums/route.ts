import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import slugify from 'slugify'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const formData = await req.formData()

  const albumName = formData.get('albumName') as string
  const files = formData.getAll('files') as File[]

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const slug = slugify(albumName, { lower: true, strict: true })

  const { data: album } = await supabase
    .from('albums')
    .insert([{ name: albumName, slug: slug, user_id: user.id }])
    .select()
    .single()

for (const file of files) {
  const path = `${album.id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase
    .storage
    .from('image-bucket') 
    .upload(path, file)

  if (uploadError) {
    console.error('Upload failed:', uploadError.message)
    continue // or return a failure response
  }

  await supabase.from('images').insert([
    {
      album_id: album.id,
      image_url: path,
    },
  ])
}


  return NextResponse.json({ slug: album.slug })
}

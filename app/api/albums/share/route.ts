// app/api/albums/share/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const albumId = req.nextUrl.searchParams.get('albumId')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !albumId) {
    return NextResponse.json({ error: 'Unauthorized or missing album' }, { status: 401 })
  }

  const { data: album } = await supabase
    .from('albums')
    .select('slug')
    .eq('id', albumId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 })
  }

  // Create signed URL pointing to this page
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/album/${album.slug}`

  // You could alternatively store this URL in a "shared_links" table and serve it via a public page with access token logic

  return NextResponse.json({ url: shareUrl })
}

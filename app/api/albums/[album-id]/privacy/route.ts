import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
    req: NextRequest,
    { params }: { params: { 'album-id': string } }
) {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { is_public } = body

    const { data: updatedAlbum, error } = await supabase
        .from('albums')
        .update({ is_public })
        .eq('id', params['album-id'])
        .eq('user_id', user.id)
        .select()
        .single()

    if (error || !updatedAlbum) {
        return NextResponse.json(
            { error: error?.message || 'Failed to update privacy' },
            { status: 500 }
        )
    }

    return NextResponse.json({ album: updatedAlbum })
}

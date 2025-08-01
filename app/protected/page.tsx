import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { PhotoUploadForm } from "@/components/photo-upload-form"
import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'
import { AlbumPreviewCard } from '@/components/album-preview-card'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/auth/login')
  }

  // Fetch albums
  const { data: albums, error: albumsError } = await supabase
    .from('albums')
    .select('id, name, slug, description')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })

  const albumsWithCover = await Promise.all(
    (albums ?? []).map(async (album) => {
      const { data: image } = await supabase
        .from('images')
        .select('image_url')
        .eq('album_id', album.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      let coverImageUrl: string | null = null
      if (image?.image_url) {
        const { data: signedUrl } = await supabase.storage
          .from('image-bucket')
          .createSignedUrl(image.image_url, 60 * 60 * 24 * 7)
        coverImageUrl = signedUrl?.signedUrl ?? null
      }

      return {
        ...album,
        coverImageUrl,
      }
    })
  )

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto gap-8 py-8">
      {/* Photo Upload Form */}
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              Upload Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload a Photo</DialogTitle>
              <DialogDescription>Select a file to upload.</DialogDescription>
            </DialogHeader>
            <PhotoUploadForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* User's Albums */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Your Albums</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {albumsWithCover.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No albums yet.</p>
          ) : (
            albumsWithCover.map((album) => (
              <AlbumPreviewCard
                key={album.id}
                slug={album.slug}
                name={album.name}
                description={album.description}
                thumbnailUrl={album.coverImageUrl ?? undefined}
              />
            ))
          )}
        </div>
      </div>

      {/* User greeting and logout */}
      <div className="flex items-center gap-2 mt-8">
        <p>
          Hello <span>{userData.user.email}</span>
        </p>
        <LogoutButton />
      </div>
    </div>
  )
}

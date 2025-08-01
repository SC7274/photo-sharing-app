import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { PhotoUploadForm } from '@/components/photo-upload-form'
import { LogoutButton } from '@/components/logout-button'
import { AlbumPreviewCard } from '@/components/album-preview-card'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/auth/login')
  }

  // Dynamically determine host and protocol for absolute fetch URL
  const headersList = headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'

  // Call the API route to get albums with covers
  const res = await fetch(`${protocol}://${host}/api/albums/user`, {
    headers: {
      Cookie: headersList.get('cookie') || '',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch albums')
  }

  const { albums } = await res.json()

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
          {albums?.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No albums yet.</p>
          ) : (
            albums.map((album: any) => (
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

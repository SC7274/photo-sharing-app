import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { PhotoUploadForm } from "@/components/photo-upload-form";
import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

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
          <PhotoUploadForm/>

        </DialogContent>
      </Dialog>
      </div>
      {/* User's Albums */}
      <div>
        {/* TODO: Replace with actual albums list */}
        <h2 className="text-lg font-semibold mb-2">Your Albums</h2>
        {/* Albums list goes here */}
      </div>
      {/* User greeting and logout */}
      <div className="flex items-center gap-2 mt-8">
        <p>
          Hello <span>{data.user.email}</span>
        </p>
        <LogoutButton />
      </div>
    </div>
  )
}

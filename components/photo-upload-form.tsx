'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PhotoUploadForm() {
  const [albumName, setAlbumName] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('albumName', albumName)
    if (files) {
      Array.from(files).forEach((file) => formData.append('files', file))
    }

    const res = await fetch('/api/albums', {
      method: 'POST',
      body: formData,
    })

    const result = await res.json()
    router.push(`/album/${result.slug}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Album name"
        value={albumName}
        onChange={(e) => setAlbumName(e.target.value)}
        required
      />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(e.target.files)}
        required
      />
      <button type="submit">Create Album</button>
    </form>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

interface AlbumPreviewCardProps {
  slug: string
  name: string
  description?: string
  thumbnailUrl?: string // public image path
}

export function AlbumPreviewCard({
  slug,
  name,
  description,
  thumbnailUrl,
}: AlbumPreviewCardProps) {
  return (
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-0">
        <div className="relative w-full h-48 bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={`${name}`}
              fill
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No cover image
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link
          href={`/album/${slug}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View Album →
        </Link>
      </CardFooter>
    </Card>
  )
}

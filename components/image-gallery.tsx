"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ImageRow = {
  id: number;
  file_path: string;
  caption: string | null;
};

export default function ImageGallery() {
  const [items, setItems] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0); // carousel index
  const PAGE_SIZE = 3;

  useEffect(() => {
    async function loadImages() {
      const { data, error } = await supabase.from("images").select("*");

      if (!error && data) {
        setItems(data);
      }

      setLoading(false);
    }

    loadImages();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        Loading images…
      </div>
    );
  }

  // select 3 images starting at current index, wrap around
  const visible = items.length
    ? [0, 1, 2].map((offset) => items[(index + offset) % items.length])
    : [];

  const handleNext = () => {
    setIndex((prev) => (prev + PAGE_SIZE) % items.length);
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <div
        className="
        grid gap-4
        grid-cols-1 sm:grid-cols-2 md:grid-cols-3
        max-w-4xl w-full
      "
      >
        {visible.map((img) => {
          const publicUrl = supabase.storage
            .from("images")
            .getPublicUrl(img.file_path).data.publicUrl;

          return (
            <Card key={img.id} className="overflow-hidden rounded-xl shadow-md">
              <div className="relative w-full h-48">
                <Image
                  src={publicUrl}
                  alt={img.caption ?? ""}
                  fill
                  className="object-cover"
                />
              </div>

              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {img.caption ?? "No caption"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="mt-6"
        onClick={handleNext}
        disabled={items.length <= 3}
      >
        See another set
      </Button>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Hit = {
  id: string;
  text: string;
  score: number;
  metadata?: {
    metadata?: {
      file_path?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
};

export function AnswerCard({ hits }: { hits: Hit[] }) {
  const top3 = hits.slice(0, 3);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
        Top Results
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((hit) => {
          // Access the nested metadata.file_path
          const filePath = hit.metadata?.metadata?.file_path ?? "";
          const publicUrl = filePath
            ? supabase.storage.from("images").getPublicUrl(filePath).data.publicUrl
            : null;

          return (
            <Card
              key={hit.id}
              className="overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700"
            >
              <div className="relative w-full h-40">
                {publicUrl ? (
                  <Image
                    src={publicUrl}
                    alt={hit.text.slice(0, 40)}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-700 text-slate-200 text-xs">
                    No Image
                  </div>
                )}
              </div>

              <CardContent className="p-3">
                <p className="text-slate-100 text-sm line-clamp-3">{hit.text}</p>
                <p className="text-[10px] mt-2 uppercase tracking-wide text-slate-400">
                  score {(hit.score ?? 0).toFixed(3)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

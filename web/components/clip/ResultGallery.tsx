"use client";

import { Download } from "lucide-react";
import { ClipResult } from "@/types/clip";

interface ResultGalleryProps {
  results: ClipResult[];
}

export function ResultGallery({ results }: ResultGalleryProps) {
  if (results.length === 0) return null;

  return (
    <section className="space-y-4 pt-4">
      <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
        Generated Clips ({results.length})
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {results.map((clip, idx) => (
          <div
            key={idx}
            className="bg-white border border-neutral-300 rounded-3xl p-4 space-y-3 shadow-sm"
          >
            <div className="aspect-[9/16] bg-neutral-950 rounded-2xl overflow-hidden">
              <video
                src={`/generated_clips/${clip.file}`}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-sm text-neutral-900 truncate">{clip.title}</p>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                {clip.start} - {clip.end}
              </p>
            </div>
            <a
              href={`/generated_clips/${clip.file}`}
              download={clip.file}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
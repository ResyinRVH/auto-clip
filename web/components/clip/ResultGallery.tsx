"use client";

import { useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import { ClipResult } from "@/types/clip";
import { SubtitleEditor } from "@/components/clip/SubtitleEditor";

interface ResultGalleryProps {
  results: ClipResult[];
  onUpdateClip?: (index: number, updatedClip: ClipResult) => void;
}

export function ResultGallery({ results, onUpdateClip }: ResultGalleryProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (results.length === 0) return null;

  const activeClip = editingIndex !== null ? results[editingIndex] : null;

  return (
    <section className="space-y-4 pt-4">
      <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
        Generated Clips ({results.length})
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {results.map((clip, idx) => {
          const videoSrc = clip.version
            ? `/generated_clips/${clip.file}?v=${clip.version}`
            : `/generated_clips/${clip.file}`;

          return (
            <div
              key={`${clip.file}-${idx}`}
              className="bg-white border border-neutral-300 rounded-3xl p-4 space-y-3 shadow-sm"
            >
              <div className="aspect-[9/16] bg-neutral-950 rounded-2xl overflow-hidden">
                <video
                  key={videoSrc}
                  src={videoSrc}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="font-bold text-sm text-neutral-900 truncate">
                  {clip.title}
                </p>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  {clip.start} - {clip.end}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {clip.rawFile && (
                  <button
                    type="button"
                    onClick={() => setEditingIndex(idx)}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-xl text-xs font-semibold transition-all"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Edit Subtitle</span>
                  </button>
                )}

                <a
                  href={videoSrc}
                  download={clip.file}
                  className={`flex items-center justify-center gap-1.5 w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-all ${
                    clip.rawFile ? "" : "col-span-2"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {activeClip && editingIndex !== null && (
        <SubtitleEditor
          clip={activeClip}
          onClose={() => setEditingIndex(null)}
          onSaveSuccess={(updatedClip) => {
            onUpdateClip?.(editingIndex, updatedClip);
            setEditingIndex(null);
          }}
        />
      )}
    </section>
  );
}

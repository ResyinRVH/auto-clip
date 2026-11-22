"use client";

import { useRef, useState } from "react";
import { Ban, Move, RotateCcw } from "lucide-react";
import {
  LayoutOption,
  SubtitlePosition,
  SubtitleStyleOption,
} from "@/types/clip";

interface SubtitleStyleSelectorProps {
  subtitleStyle: SubtitleStyleOption;
  setSubtitleStyle: (style: SubtitleStyleOption) => void;
  layout: LayoutOption;
  position: SubtitlePosition;
  setPosition: (pos: SubtitlePosition) => void;
}

interface PresetItem {
  id: SubtitleStyleOption;
  label: string;
  description: string;
}

const SUBTITLE_PRESET_ITEMS: PresetItem[] = [
  {
    id: "bold-yellow",
    label: "Bold Yellow",
    description: "Teks kuning besar di tengah layar untuk hook tinggi",
  },
  {
    id: "clean-white",
    label: "Clean White",
    description: "Teks putih bersih minimalis di bagian bawah",
  },
  {
    id: "boxed-dark",
    label: "Boxed Dark",
    description: "Teks putih dengan kotak latar gelap kontras tinggi",
  },
  {
    id: "none",
    label: "No Subtitle",
    description: "Video bersih tanpa teks caption",
  },
];

export const DEFAULT_SUBTITLE_POSITIONS: Record<
  SubtitleStyleOption,
  SubtitlePosition
> = {
  "bold-yellow": { x: 50, y: 50 },
  "clean-white": { x: 50, y: 78 },
  "boxed-dark": { x: 50, y: 76 },
  none: { x: 50, y: 50 },
};

export function SubtitleStyleSelector({
  subtitleStyle,
  setSubtitleStyle,
  layout,
  position,
  setPosition,
}: SubtitleStyleSelectorProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSelectPreset = (presetId: SubtitleStyleOption) => {
    setSubtitleStyle(presetId);
    setPosition(DEFAULT_SUBTITLE_POSITIONS[presetId]);
  };

  const updatePositionFromPointer = (clientX: number, clientY: number) => {
    const container = previewRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    setPosition({
      x: Math.round(Math.max(12, Math.min(88, rawX))),
      y: Math.round(Math.max(10, Math.min(88, rawY))),
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Subtitle Style & Position
        </h2>
      </div>

      <div className="bg-white border border-neutral-300 rounded-3xl p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {SUBTITLE_PRESET_ITEMS.map((item) => {
              const isSelected = subtitleStyle === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item.id)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-neutral-950 ring-2 ring-neutral-950 bg-neutral-50/70 shadow-sm"
                      : "border-neutral-200 hover:border-neutral-400 bg-white"
                  }`}
                >
                  <div className="h-11 rounded-xl bg-neutral-900 flex items-center justify-center px-3 overflow-hidden">
                    {item.id === "bold-yellow" && (
                      <span
                        className="text-sm font-black tracking-wide text-[#FACC15] uppercase"
                        style={{
                          textShadow:
                            "0 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                        }}
                      >
                        HOOK CAPTION
                      </span>
                    )}
                    {item.id === "clean-white" && (
                      <span
                        className="text-xs font-bold text-white"
                        style={{
                          textShadow: "0 1px 3px rgba(0,0,0,0.95)",
                        }}
                      >
                        Clean caption text
                      </span>
                    )}
                    {item.id === "boxed-dark" && (
                      <span className="text-xs font-extrabold uppercase tracking-wide text-white bg-black/80 px-2.5 py-1 rounded">
                        BOXED CAPTION
                      </span>
                    )}
                    {item.id === "none" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400">
                        <Ban className="w-3.5 h-3.5" />
                        Disabled
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-neutral-900">
                      {item.label}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-neutral-200 pt-5 lg:pt-0 lg:pl-6">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              <span>Live 9:16 Preview</span>
              {subtitleStyle !== "none" && (
                <span className="inline-flex items-center gap-0.5 text-neutral-600">
                  <Move className="w-3 h-3" /> Drag
                </span>
              )}
            </div>

            <div
              ref={previewRef}
              onPointerMove={(e) => {
                if (isDragging) {
                  updatePositionFromPointer(e.clientX, e.clientY);
                }
              }}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
              className="relative w-36 h-64 rounded-2xl bg-neutral-900 border-2 border-neutral-800 shadow-inner overflow-hidden flex flex-col select-none touch-none"
            >
              {layout === "splitPotrait" ? (
                <>
                  <div className="h-24 bg-neutral-800 border-b border-neutral-700 flex items-center justify-center">
                    <span className="text-xs text-neutral-400 font-medium">
                      Facecam
                    </span>
                  </div>
                  <div className="flex-1 bg-gradient-to-b from-neutral-700 to-neutral-800 flex items-center justify-center">
                    <span className="text-xs text-neutral-400 font-medium">
                      Screen
                    </span>
                  </div>
                </>
              ) : layout === "landscape" ? (
                <div className="flex-1 bg-neutral-950 flex items-center justify-center">
                  <div className="w-full h-20 bg-neutral-700 flex items-center justify-center">
                    <span className="text-[9px] text-neutral-300 font-medium">
                      16:9 Frame
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-900 flex items-center justify-center">
                  <span className="text-[9px] text-neutral-400 font-medium">
                    9:16 Center
                  </span>
                </div>
              )}

              {isDragging && (
                <div className="absolute inset-y-0 left-1/2 w-px bg-yellow-400/50 pointer-events-none" />
              )}

              {subtitleStyle !== "none" && (
                <div
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setIsDragging(true);
                    updatePositionFromPointer(e.clientX, e.clientY);
                  }}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  title="Geser untuk mengatur posisi subtitle"
                  className={`absolute w-[84%] cursor-grab active:cursor-grabbing rounded-lg px-1.5 py-1 transition-shadow ${
                    isDragging
                      ? "ring-2 ring-yellow-400 bg-black/20"
                      : "hover:ring-1 hover:ring-white/50"
                  }`}
                >
                  {subtitleStyle === "bold-yellow" && (
                    <p
                      className="text-center text-xs font-black leading-tight text-[#FACC15] uppercase"
                      style={{
                        textShadow:
                          "0 2px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000",
                      }}
                    >
                      MOMEN PALING SERU!
                    </p>
                  )}

                  {subtitleStyle === "clean-white" && (
                    <p
                      className="text-center text-[11px] font-bold leading-snug text-white"
                      style={{
                        textShadow: "0 1px 3px rgba(0,0,0,0.95)",
                      }}
                    >
                      Momen paling seru di sini
                    </p>
                  )}

                  {subtitleStyle === "boxed-dark" && (
                    <div className="flex justify-center">
                      <span className="text-center text-[10px] font-extrabold leading-snug uppercase text-white bg-black/80 px-2 py-1 rounded">
                        MOMEN PALING SERU
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-7 bg-black/40 border-t border-white/10 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] text-neutral-300 tracking-wide">
                  Safe Zone
                </span>
              </div>
            </div>

            {subtitleStyle !== "none" && (
              <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-500">
                <span className="font-mono">
                  X:{position.x}% Y:{position.y}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPosition(DEFAULT_SUBTITLE_POSITIONS[subtitleStyle])
                  }
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-medium transition-colors"
                  title="Reset posisi"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

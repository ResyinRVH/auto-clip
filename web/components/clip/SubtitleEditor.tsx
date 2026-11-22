"use client";

import { useMemo, useRef, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  Check,
  Move,
  RotateCcw,
  AlignHorizontalJustifyCenter,
} from "lucide-react";
import {
  ClipResult,
  SubtitlePosition,
  SubtitleSegment,
  SubtitleStyleOption,
} from "@/types/clip";
import { DEFAULT_SUBTITLE_POSITIONS } from "./SubtitleStyleSelector";

interface SubtitleEditorModalProps {
  clip: ClipResult;
  onClose: () => void;
  onSaveSuccess: (updatedClip: ClipResult) => void;
}

const STYLE_OPTIONS: { id: SubtitleStyleOption; label: string }[] = [
  { id: "bold-yellow", label: "Bold Yellow" },
  { id: "clean-white", label: "Clean White" },
  { id: "boxed-dark", label: "Boxed Dark" },
  { id: "none", label: "No Subtitle" },
];

export function SubtitleEditor({
  clip,
  onClose,
  onSaveSuccess,
}: SubtitleEditorModalProps) {
  const [segments, setSegments] = useState<SubtitleSegment[]>(() =>
    clip.subtitles && clip.subtitles.length > 0
      ? clip.subtitles.map((s) => ({ ...s }))
      : [{ start: 0.5, end: 3.0, text: "" }],
  );
  const [style, setStyle] = useState<SubtitleStyleOption>(
    clip.subtitleStyle ?? "bold-yellow",
  );
  const [position, setPosition] = useState<SubtitlePosition>({
    x: clip.posX ?? 50,
    y: clip.posY ?? 50,
  });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const videoStageRef = useRef<HTMLDivElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const activeCaption = useMemo(() => {
    const matched = segments.find(
      (seg) =>
        seg.text.trim().length > 0 &&
        currentTime >= seg.start &&
        currentTime <= seg.end,
    );
    if (matched) return matched.text;
    const firstNonEmpty = segments.find((seg) => seg.text.trim().length > 0);
    return firstNonEmpty ? firstNonEmpty.text : "Preview teks subtitle";
  }, [segments, currentTime]);

  const updatePositionFromPointer = (clientX: number, clientY: number) => {
    const stage = videoStageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;
    setPosition({
      x: Math.round(Math.max(10, Math.min(90, rawX))),
      y: Math.round(Math.max(8, Math.min(92, rawY))),
    });
  };

  const handleSegmentChange = (
    index: number,
    field: keyof SubtitleSegment,
    value: string | number,
  ) => {
    setSegments((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === "text") {
          return { ...item, text: String(value) };
        }
        const numeric = Math.max(0, Number(value) || 0);
        return { ...item, [field]: Number(numeric.toFixed(2)) };
      }),
    );
  };

  const nudgeTime = (index: number, field: "start" | "end", delta: number) => {
    setSegments((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const nextVal = Math.max(0, Number((item[field] + delta).toFixed(2)));
        return { ...item, [field]: nextVal };
      }),
    );
  };

  const handleAddRow = () => {
    const lastSeg = segments[segments.length - 1];
    const nextStart = lastSeg ? Number((lastSeg.end + 0.1).toFixed(2)) : 0;
    const nextEnd = Number((nextStart + 2.5).toFixed(2));
    setSegments((prev) => [
      ...prev,
      { start: nextStart, end: nextEnd, text: "" },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setSegments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSeekTo = (timeSec: number) => {
    if (videoElRef.current) {
      videoElRef.current.currentTime = timeSec;
      setCurrentTime(timeSec);
    }
  };

  const handleSaveAndRerender = async () => {
    setErrorMsg("");

    if (!clip.rawFile) {
      setErrorMsg(
        "File video raw tidak tersedia untuk klip ini. Silakan generate ulang video.",
      );
      return;
    }

    const validSegments = segments
      .map((s) => ({
        start: Number(s.start),
        end: Number(s.end),
        text: s.text.trim(),
      }))
      .filter((s) => s.text.length > 0);

    for (let i = 0; i < validSegments.length; i++) {
      const seg = validSegments[i];
      if (seg.start < 0 || seg.end <= seg.start) {
        setErrorMsg(
          `Baris #${i + 1}: Waktu selesai (${seg.end}s) harus lebih besar dari waktu mulai (${seg.start}s).`,
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/rerender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawFile: clip.rawFile,
          outputFile: clip.file,
          subtitles: validSegments,
          subtitleStyle: style,
          posX: position.x,
          posY: position.y,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan perubahan subtitle.");
      }

      onSaveSuccess({
        ...clip,
        subtitles: validSegments,
        subtitleStyle: style,
        posX: position.x,
        posY: position.y,
        version: data.version || Date.now(),
      });
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat re-render.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const previewVideoSrc = clip.rawFile
    ? `/generated_clips/${clip.rawFile}`
    : `/generated_clips/${clip.file}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-300 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">
              Edit Subtitle & Position
            </h3>
            <p className="text-xs text-neutral-500">
              {clip.title} ({clip.start} - {clip.end})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-[260px] mb-2">
              <span className="text-xs font-semibold text-neutral-600 inline-flex items-center gap-1">
                <Move className="w-3.5 h-3.5" /> Geser teks di video
              </span>
              <span className="text-xs font-mono text-neutral-500">
                X:{position.x}% Y:{position.y}%
              </span>
            </div>

            <div
              ref={videoStageRef}
              onPointerMove={(e) => {
                if (isDragging) {
                  updatePositionFromPointer(e.clientX, e.clientY);
                }
              }}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
              className="relative w-full max-w-[260px] aspect-[9/16] bg-neutral-950 rounded-2xl overflow-hidden border-2 border-neutral-800 select-none touch-none shadow-md"
            >
              <video
                ref={videoElRef}
                src={previewVideoSrc}
                controls
                playsInline
                onTimeUpdate={(e) =>
                  setCurrentTime(e.currentTarget.currentTime)
                }
                className="w-full h-full object-cover"
              />

              {isDragging && (
                <div className="absolute inset-y-0 left-1/2 w-px bg-yellow-400/60 pointer-events-none" />
              )}

              {style !== "none" && (
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
                  className={`absolute w-[86%] cursor-grab active:cursor-grabbing rounded-lg px-2 py-1 ${
                    isDragging
                      ? "ring-2 ring-yellow-400 bg-black/25"
                      : "hover:ring-1 hover:ring-white/60"
                  }`}
                >
                  {style === "bold-yellow" && (
                    <p
                      className="text-center text-sm font-black leading-tight text-[#FACC15] uppercase"
                      style={{
                        textShadow:
                          "0 2px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000",
                      }}
                    >
                      {activeCaption}
                    </p>
                  )}
                  {style === "clean-white" && (
                    <p
                      className="text-center text-xs font-bold leading-snug text-white"
                      style={{
                        textShadow: "0 1px 3px rgba(0,0,0,0.95)",
                      }}
                    >
                      {activeCaption}
                    </p>
                  )}
                  {style === "boxed-dark" && (
                    <div className="flex justify-center">
                      <span className="text-center text-[11px] font-extrabold leading-snug uppercase text-white bg-black/80 px-2.5 py-1 rounded">
                        {activeCaption}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setPosition((prev) => ({ ...prev, x: 50 }))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700"
              >
                <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                Center X
              </button>
              <button
                type="button"
                onClick={() => setPosition(DEFAULT_SUBTITLE_POSITIONS[style])}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Posisi
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Gaya Subtitle
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStyle(opt.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      style === opt.id
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Timeframe & Teks Dialog ({segments.length} baris)
                </label>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Baris
                </button>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {segments.map((seg, index) => {
                  const isActiveRow =
                    currentTime >= seg.start && currentTime <= seg.end;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl border transition-colors space-y-2 ${
                        isActiveRow
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSeekTo(seg.start)}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-700"
                            title="Lompat video ke detik ini"
                          >
                            #{index + 1}
                          </button>

                          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg px-1.5 py-1">
                            <span className="text-[10px] font-semibold text-neutral-500">
                              Start
                            </span>
                            <button
                              type="button"
                              onClick={() => nudgeTime(index, "start", -0.2)}
                              className="px-1 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={seg.start}
                              onChange={(e) =>
                                handleSegmentChange(
                                  index,
                                  "start",
                                  e.target.value,
                                )
                              }
                              className="w-14 text-center text-xs font-mono bg-white border border-neutral-300 rounded px-1 py-0.5"
                            />
                            <button
                              type="button"
                              onClick={() => nudgeTime(index, "start", 0.2)}
                              className="px-1 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg px-1.5 py-1">
                            <span className="text-[10px] font-semibold text-neutral-500">
                              End
                            </span>
                            <button
                              type="button"
                              onClick={() => nudgeTime(index, "end", -0.2)}
                              className="px-1 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={seg.end}
                              onChange={(e) =>
                                handleSegmentChange(
                                  index,
                                  "end",
                                  e.target.value,
                                )
                              }
                              className="w-14 text-center text-xs font-mono bg-white border border-neutral-300 rounded px-1 py-0.5"
                            />
                            <button
                              type="button"
                              onClick={() => nudgeTime(index, "end", 0.2)}
                              className="px-1 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={seg.text}
                        placeholder="Tulis teks subtitle..."
                        onChange={(e) =>
                          handleSegmentChange(index, "text", e.target.value)
                        }
                        className="w-full text-sm text-neutral-900 bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none rounded-xl px-3 py-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-red-600 font-medium">{errorMsg}</div>
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAndRerender}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white text-xs font-semibold transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rendering...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Re-render</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

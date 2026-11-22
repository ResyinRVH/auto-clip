"use client";

import { useState } from "react";
import { VideoInputBar } from "@/components/clip/VideoInputBar";
import { LayoutClipSelector } from "@/components/clip/LayoutClipSelector";
import { SubtitleStyleSelector } from "@/components/clip/SubtitleStyleSelector";
import { ConfigurationClip } from "@/components/clip/ConfigurationClip";
import { ResultGallery } from "@/components/clip/ResultGallery";
import {
  LayoutOption,
  ClipMode,
  ClipResult,
  SubtitlePosition,
  SubtitleStyleOption,
} from "@/types/clip";

export default function ClipPage() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<ClipMode>("ai");
  const [layout, setLayout] = useState<LayoutOption>("splitPotrait");
  const [subtitleStyle, setSubtitleStyle] =
    useState<SubtitleStyleOption>("bold-yellow");
  const [subtitlePosition, setSubtitlePosition] = useState<SubtitlePosition>({
    x: 50,
    y: 50,
  });
  const [maxClips, setMaxClips] = useState(3);
  const [durationSec, setDurationSec] = useState(60);
  const [intervalMinutes, setIntervalMinutes] = useState(2);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<ClipResult[]>([]);

  const handleGenerate = async () => {
    if (!url) return;

    setIsLoading(true);
    setErrorMsg("");
    setResults([]);

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          layout,
          mode,
          subtitleStyle,
          posX: subtitlePosition.x,
          posY: subtitlePosition.y,
          intervalMinutes: mode === "interval" ? intervalMinutes : undefined,
          maxClips: mode === "ai" ? maxClips : maxClips || 0,
          maxDuration: durationSec,
          minDuration: Math.max(15, durationSec - 30),
          autoSubtitle: subtitleStyle !== "none",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.details || data.error || "Gagal memproses video");
      }

      if (Array.isArray(data.clips)) {
        const enrichedClips: ClipResult[] = data.clips.map(
          (clip: ClipResult) => ({
            ...clip,
            subtitleStyle,
            posX: subtitlePosition.x,
            posY: subtitlePosition.y,
          }),
        );
        setResults(enrichedClips);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      <VideoInputBar
        url={url}
        setUrl={setUrl}
        mode={mode}
        setMode={setMode}
        isLoading={isLoading}
        onGenerate={handleGenerate}
      />
      <LayoutClipSelector layout={layout} setLayout={setLayout} />
      <SubtitleStyleSelector
        subtitleStyle={subtitleStyle}
        setSubtitleStyle={setSubtitleStyle}
        layout={layout}
        position={subtitlePosition}
        setPosition={setSubtitlePosition}
      />
      <ConfigurationClip
        mode={mode}
        maxClips={maxClips}
        setMaxClips={setMaxClips}
        durationSec={durationSec}
        setDurationSec={setDurationSec}
        intervalMinutes={intervalMinutes}
        setIntervalMinutes={setIntervalMinutes}
      />

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      <ResultGallery
        results={results}
        onUpdateClip={(index, updatedClip) =>
          setResults((prev) =>
            prev.map((item, idx) => (idx === index ? updatedClip : item)),
          )
        }
      />
    </div>
  );
}

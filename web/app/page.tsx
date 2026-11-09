"use client";

import { useState } from "react";
import {
  Layers,
  Scissors,
  CheckCircle2,
  Sliders,
  Download,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa6";

interface ClipResult {
  title: string;
  start: string;
  end: string;
  file: string;
}

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [layout, setLayout] = useState<"gaming" | "talking_head" | "centered">("gaming");
  const [maxClips, setMaxClips] = useState(3);
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClipResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState<"ai" | "interval">("ai");
  const [intervalMinutes, setIntervalMinutes] = useState<number>(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          intervalMinutes: mode === "interval" ? intervalMinutes : undefined,
          maxClips: mode === "ai" ? maxClips : undefined,
          minDuration,
          maxDuration,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.details || data.error || "Gagal memproses video");
      }

      if (Array.isArray(data.clips)){
        setResults(data.clips);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga saat memproses video");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <Scissors className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">AutoClip</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                v1.0 Solo
              </span>
            </div>
            <p className="text-neutral-400 text-sm mt-1">
              Automated smart highlight extraction & vertical 9:16 layout renderer.
            </p>
          </div>

        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
              <FaYoutube className="w-4 h-4 text-red-500" />
              <span>YouTube Video URL</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition duration-150"
              />
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-sm font-medium text-neutral-300">Clip Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${mode === "ai"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                >AI Auto Highlight</button>

                <button
                  type="button"
                  onClick={() => setMode("interval")}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${mode === "interval"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                >
                  Cut by Time
                </button>
              </div>

            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Pilih Layout Template (9:16)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setLayout("gaming")}
                className={`relative flex flex-col text-left p-4 rounded-xl border transition-all ${layout === "gaming"
                  ? "bg-violet-950/20 border-violet-500/80 ring-1 ring-violet-500/50"
                  : "bg-neutral-950/50 border-neutral-800 hover:border-neutral-700"
                  }`}
              >
                {layout === "gaming" && (
                  <CheckCircle2 className="w-4 h-4 text-violet-400 absolute top-3 right-3" />
                )}
                <div className="w-full h-24 bg-neutral-900 rounded-lg border border-neutral-800 mb-3 flex flex-col p-1.5 gap-1 overflow-hidden">
                  <div className="h-2/5 w-full bg-violet-600/30 rounded border border-violet-500/40 flex items-center justify-center text-[10px] text-violet-300 font-mono">
                    Facecam (Top)
                  </div>
                  <div className="h-3/5 w-full bg-neutral-800/80 rounded border border-neutral-700/60 flex items-center justify-center text-[10px] text-neutral-400 font-mono">
                    Gameplay (Bottom)
                  </div>
                </div>
                <span className="font-medium text-sm text-neutral-200">Gaming Split</span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  Top-Cam + Bottom-Gameplay vertical stacking.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLayout("centered")}
                className={`relative flex flex-col text-left p-4 rounded-xl border transition-all ${layout === "centered"
                  ? "bg-violet-950/20 border-violet-500/80 ring-1 ring-violet-500/50"
                  : "bg-neutral-950/50 border-neutral-800 hover:border-neutral-700"
                  }`}
              >
                {layout === "centered" && (
                  <CheckCircle2 className="w-4 h-4 text-violet-400 absolute top-3 right-3" />
                )}
                <div className="w-full h-24 bg-neutral-900 rounded-lg border border-neutral-800 mb-3 flex items-center justify-center p-1.5">
                  <div className="h-full w-14 bg-neutral-800/80 rounded border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-300 font-mono">
                    9:16 Focus
                  </div>
                </div>
                <span className="font-medium text-sm text-neutral-200">Auto Centered Crop</span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  Fokus potong di tengah frame untuk podcast/vlog.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLayout("talking_head")}
                className={`relative flex flex-col text-left p-4 rounded-xl border transition-all ${layout === "talking_head"
                  ? "bg-violet-950/20 border-violet-500/80 ring-1 ring-violet-500/50"
                  : "bg-neutral-950/50 border-neutral-800 hover:border-neutral-700"
                  }`}
              >
                {layout === "talking_head" && (
                  <CheckCircle2 className="w-4 h-4 text-violet-400 absolute top-3 right-3" />
                )}
                <div className="w-full h-24 bg-neutral-900/60 rounded-lg border border-neutral-800 mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-neutral-700/20 backdrop-blur-md" />
                  <div className="relative w-28 h-16 bg-neutral-800 rounded border border-neutral-600 flex items-center justify-center text-[10px] text-neutral-300 font-mono shadow-lg">
                    16:9 Center
                  </div>
                </div>
                <span className="font-medium text-sm text-neutral-200">Blurred Backdrop</span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  Video asli di tengah dengan background blur 9:16.
                </span>
              </button>
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Konfigurasi Pemotongan Segmen</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Target Jumlah Klip</span>
                  <span className="font-mono text-neutral-200">{maxClips} Klip</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={maxClips}
                  onChange={(e) => setMaxClips(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Durasi Minimal</span>
                  <span className="font-mono text-neutral-200">{minDuration}s</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  value={minDuration}
                  onChange={(e) => setMinDuration(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Durasi Maksimal</span>
                  <span className="font-mono text-neutral-200">{maxDuration}s</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="90"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading || !url}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold shadow-lg transition-all ${isLoading || !url
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
                : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20 active:scale-[0.98]"
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Memproses Video Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Generate Auto-Clips</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm">
            ❌ {errorMsg}
          </div>
        )}

        {results.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-200">
                Klip Berhasil Dirender ({results.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {results.map((clip, i) => (
                <div
                  key={i}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden p-4 space-y-3"
                >
                  <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
                    <video
                      src={`/generated_clips/${clip.file}`}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm truncate text-neutral-200">
                      {clip.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">
                      {clip.start} - {clip.end}
                    </p>
                  </div>
                  <a
                    href={`/generated_clips/${clip.file}`}
                    download={clip.file}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Klip</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
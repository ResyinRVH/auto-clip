"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { ClipMode } from "@/types/clip";

interface VideoInputBarProps {
  url: string;
  setUrl: (v: string) => void;
  mode: ClipMode;
  setMode: (m: ClipMode) => void;
  isLoading: boolean;
  onGenerate: () => void;
}

export function VideoInputBar({
  url,
  setUrl,
  mode,
  setMode,
  isLoading,
  onGenerate,
}: VideoInputBarProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Video</h2>

      <div className="bg-white border border-neutral-300 rounded-[28px] p-2 pl-6 flex items-center shadow-xl hover:border-neutral-400 transition-all">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube link here..."
          className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />

        <div className="relative flex items-center pr-3">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ClipMode)}
            className="appearance-none bg-transparent pr-4 pl-3 py-2 text-sm font-semibold text-neutral-800 cursor-pointer focus:outline-none"
          >
            <option value="ai">AI Auto Highlight</option>
            <option value="interval">Cut by Time</option>
          </select>
          <ChevronDown className="w-4 h-4 text-neutral-600 absolute right-2 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || !url}
          className="bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate</span>
          )}
        </button>
      </div>
    </section>
  );
}
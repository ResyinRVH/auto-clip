"use client";

import { ChevronDown } from "lucide-react";
import { ClipMode } from "@/types/clip";

interface ConfigurationClipProps {
  mode: ClipMode;
  maxClips: number;
  setMaxClips: (n: number) => void;
  durationSec: number;
  setDurationSec: (d: number) => void;
  intervalMinutes: number;
  setIntervalMinutes: (m: number) => void;
}

export function ConfigurationClip({
  mode,
  maxClips,
  setMaxClips,
  durationSec,
  setDurationSec,
  intervalMinutes,
  setIntervalMinutes,
}: ConfigurationClipProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
        Configuration Clip
      </h2>

      <div className="bg-white border border-neutral-300 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-10 md:gap-14">
          <div className="space-y-2">
            <span className="text-xs text-neutral-600 font-medium">
              Number of Clip
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxClips(num)}
                  className={`w-9 h-9 rounded-lg border text-xs font-semibold transition-all ${
                    maxClips === num
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {num}
                </button>
              ))}

              <div className="relative">
                <select
                  value={maxClips > 3 || maxClips === 0 ? maxClips : "custom"}
                  onChange={(e) => setMaxClips(Number(e.target.value))}
                  className="w-9 h-9 border border-neutral-300 rounded-lg text-xs font-semibold appearance-none bg-white text-center cursor-pointer focus:outline-none pl-1"
                >
                  <option value="custom" disabled hidden>
                    v
                  </option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={0}>All</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute top-2.5 right-2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-neutral-600 font-medium">
              {mode === "ai" ? "Duration of Clip" : "Interval per Part"}
            </span>

            {mode === "ai" ? (
              <div className="flex items-center gap-1">
                {[60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDurationSec(sec)}
                    className={`px-2.5 h-9 rounded-lg border text-xs font-semibold transition-all ${
                      durationSec === sec
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}

                <div className="relative">
                  <select
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
                    className="h-9 px-2 border border-neutral-300 rounded-lg text-xs font-semibold appearance-none bg-white cursor-pointer focus:outline-none pr-6"
                  >
                    <option value={30}>30s</option>
                    <option value={45}>45s</option>
                    <option value={60}>60s</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute top-2.5 right-1.5 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setIntervalMinutes(min)}
                    className={`px-3 h-9 rounded-lg border text-xs font-semibold transition-all ${
                      intervalMinutes === min
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

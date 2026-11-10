"use client";

import { LayoutOption } from "@/types/clip";

interface LayoutClipSelectorProps {
    layout: LayoutOption;
    setLayout: (l: LayoutOption) => void;
}

export function LayoutClipSelector({ layout, setLayout }: LayoutClipSelectorProps) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Layout Clip</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <button
                    type="button"
                    onClick={() => setLayout("centerPotrait")}
                    className={`bg-white border rounded-3xl p-8 flex flex-col items-center justify-between h-56 transition-all ${layout === "centerPotrait"
                            ? "border-neutral-950 ring-2 ring-neutral-950 shadow-md"
                            : "border-neutral-300 hover:border-neutral-400 shadow-sm"
                        }`}
                >
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-14 h-24 bg-neutral-600 rounded-xl shadow-inner" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-800">Center Potrait</span>
                </button>

                <button
                    type="button"
                    onClick={() => setLayout("landscape")}
                    className={`bg-white border rounded-3xl p-8 flex flex-col items-center justify-between h-56 transition-all ${layout === "landscape"
                            ? "border-neutral-950 ring-2 ring-neutral-950 shadow-md"
                            : "border-neutral-300 hover:border-neutral-400 shadow-sm"
                        }`}
                >
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-28 h-16 bg-neutral-600 rounded-xl shadow-inner" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-800">Landscape</span>
                </button>

                <button
                    type="button"
                    onClick={() => setLayout("splitPotrait")}
                    className={`bg-white border rounded-3xl p-8 flex flex-col items-center justify-between h-56 transition-all ${layout === "splitPotrait"
                            ? "border-neutral-950 ring-2 ring-neutral-950 shadow-md"
                            : "border-neutral-300 hover:border-neutral-400 shadow-sm"
                        }`}
                >
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-14 h-24 rounded-xl overflow-hidden flex flex-col shadow-inner">
                            <div className="h-10 bg-neutral-900 border-b border-neutral-700" />
                            <div className="flex-1 bg-neutral-500" />
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-800">Split Potrait</span>
                </button>
            </div>
        </section>
    );
}
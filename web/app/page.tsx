import Link from "next/link";
import { Scissors, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="h-full min-h-[75vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-white border border-neutral-200/80 shadow-sm flex items-center justify-center text-neutral-800 mb-5">
        <Scissors className="w-7 h-7 stroke-[2]" />
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        Selamat Datang di Klip
      </h1>
      <p className="text-sm text-neutral-500 max-w-md mt-2 mb-8 leading-relaxed">
        Ubah video panjang atau siaran langsung YouTube menjadi klip vertikal siap unggah ke TikTok, Reels, dan Shorts.
      </p>

      <Link
        href="/clip"
        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-all shadow-sm"
      >
        <span>Mulai Buat Klip</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
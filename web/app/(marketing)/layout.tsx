import Link from "next/link";
import { Clapperboard, ArrowRight, } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#5E95BE] selection:text-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md w-full">
        <div className="w-full px-[20px] h-20 flex items-center justify-between lg:grid lg:grid-cols-12 lg:gap-[20px]">
          <div className="lg:col-span-3 flex items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center text-brand">
                <Clapperboard className="w-10 h-10 stroke-[1]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-brand">
                Creator Studio
              </span>
            </Link>
          </div>

          <nav className="hidden lg:col-start-5 lg:col-span-4 lg:flex items-center justify-center gap-8 text-sm font-semibold text-black">
            <Link href="/" className="hover:text-brand transition-colors">
              Home
            </Link>
            <a
              href="#how-it-works"
              className="hover:text-brand transition-colors"
            >
              How it Works
            </a>
            <a
              href="#features"
              className="hover:text-brand transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-brand transition-colors"
            >
              Pricing
            </a>
          </nav>

          <div className="lg:col-start-11 lg:col-span-2 flex items-center justify-end gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-black hover:text-brand transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/clip"
              className="px-4 py-2 rounded-lg border-2 border-brand-light bg-white hover:bg-neutral-50 text-sm font-semibold text-black hover:text-brand shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all whitespace-nowrap"
            >
              Try Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="w-full mx-auto px-4 sm:px-6 pb-8 pt-6">
        <div className="rounded-3xl bg-brand-light px-8 sm:px-14 pt-12 pb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-10 pb-12 border-b border-neutral-300/80">
            <div className="max-w-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center text-brand">
                  <Clapperboard className="w-10 h-10" />
                </div>
                <span className="text-lg font-bold text-brand">
                  Creator Studio
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-neutral-900 leading-snug tracking-tight">
                Focus on Streaming. Let AI Handle Your Clips.
              </h3>

              <div className="pt-1">
                <Link
                  href="/clip"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5E95BE] hover:bg-[#4F85AE] text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <span>Get started It&apos;s free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-xs font-medium text-neutral-700 self-start lg:self-center">
              <a
                href="#about"
                className="inline-flex items-center gap-2 hover:text-neutral-950 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <span>About us</span>
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 hover:text-neutral-950 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <span>Features</span>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 hover:text-neutral-950 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <span>Contact</span>
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 hover:text-neutral-950 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <span>Pricing</span>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 hover:text-neutral-950 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <span>How it works</span>
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-600">
            <p>&copy; {new Date().getFullYear()} Creator Studio. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <a
                href="#privacy"
                className="hover:text-neutral-950 transition-colors"
              >
                Privacy Policy
              </a>
              <span>|</span>
              <a
                href="#terms"
                className="hover:text-neutral-950 transition-colors"
              >
                Terms of Service
              </a>
              <span>|</span>
              <a
                href="#support"
                className="hover:text-neutral-950 transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

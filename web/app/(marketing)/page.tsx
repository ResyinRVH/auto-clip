import Link from "next/link";
import { Clapperboard, Brain, Check, TrendingUp, Captions } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Smart Highlight Detection",
    description:
      "Skip scrubbing through hours of footage. Our AI listens to and analyzes your stream to find the most engaging moments.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Virality Score & Auto Title",
    description:
      "Every clip comes with a score (1-100) and a brief description so you know which clips will perform best before even watching.",
  },
  {
    icon: <Captions className="w-6 h-6" />,
    title: "Auto Captions & 9:16 Formatting",
    description:
      "Automatically reframed for TikTok, YouTube Shorts, and Reels with accurate, customizable subtitles.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    subtitle: "Perfect for testing how AI clips your streams.",
    price: "FREE",
    period: "/day",
    cta: "Get Started",
    href: "/clip",
    featured: false,
    perks: [
      "20 minutes of video processing / day",
      "Up to 5 AI clips per stream",
      "720p export quality",
      "Standard auto captions",
    ],
  },
  {
    name: "Creator Pro",
    subtitle: "Built for daily streamers who want consistent growth & quality.",
    price: "$15",
    period: "/month",
    cta: "Get Started",
    href: "/clip",
    featured: true,
    perks: [
      "1200 minutes of processing / month",
      "Unlimited AI clips & virality score",
      "1080p Full HD export",
      "Custom subtitle templates & fonts",
    ],
  },
  {
    name: "Pro Max",
    subtitle: "For full time streamers, agencies, and channel editors.",
    price: "$39",
    period: "/month",
    cta: "Get Started",
    href: "/clip",
    featured: false,
    perks: [
      "2,400 minutes of processing / month",
      "Priority fast AI rendering",
      "Custom brand kit (logo & colors)",
      "Direct auto post to TikTok & Shorts",
      "Priority support",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-24 pb-16">
      <section className="max-w-12xl mx-auto px-4 sm:px-6 pt-2">
        <div className="rounded-3xl bg-brand-light min-h-[724px] flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="flex items-center justify-center text-brand mb-6">
            <Clapperboard className="w-32 h-32 stroke-[0.5]" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-black leading-tight">
            Auto cut long video to short video
            <span className="block text-brand mt-1">
              for fast create content
            </span>
          </h1>

          <p className="mt-5 text-xs lg:text-sm text-black">
            Instantly create content for your social media.
          </p>

          <div className="mt-5 px-10 py-2.5 rounded-lg bg-brand hover:bg-[#4F85AE] text-white text-sm font-semibold transition-all">
            <Link href="/clip">Try Free</Link>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-4 sm:px-6 text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 max-w-md mx-auto leading-snug">
          How Creator Studio create content for you?
        </h2>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              category: "Gaming",
              src: "/generated_clips/clip_1_Part_1.mp4",
              captionStyle: "text-white font-extrabold drop-shadow",
            },
            {
              category: "Podcast",
              src: "/generated_clips/clip_1_Part_1.mp4",
              captionStyle: "text-white font-black tracking-wide drop-shadow",
            },
            {
              category: "Podcast",
              src: "/generated_clips/clip_1_Part_1.mp4",
              captionStyle: "",
            },
            {
              category: "Podcast",
              src: "/generated_clips/clip_1_Part_1.mp4",
              captionStyle: "text-white font-black tracking-wide drop-shadow",
            },
            {
              category: "Gaming",
              src: "/generated_clips/clip_1_Part_1.mp4",
              captionStyle:
                "text-[#4ADE80] font-black italic drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center ${
                idx === 4
                  ? "col-span-2 sm:col-span-1 max-w-[200px] sm:max-w-none mx-auto w-full"
                  : ""
              }`}
            >
              <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200/80 shadow-sm group">
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black" />

                <video
                  src={item.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <span className="mt-2.5 text-xs font-medium text-neutral-600">
                {item.category}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 px-2">
            <h3 className="text-sm font-bold text-neutral-950">
              Paste Your Stream Link
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-[240px] mx-auto">
              Copy your YouTube livestream URL and paste it into the dashboard.
            </p>
          </div>

          <div className="space-y-2 px-2">
            <h3 className="text-sm font-bold text-neutral-950">
              AI Picks the Best Moments
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-[250px] mx-auto">
              Get 5-15 ready made clips, automatically ranked with a virality
              score, title, and description ready to upload.
            </p>
          </div>

          <div className="space-y-2 px-2">
            <h3 className="text-sm font-bold text-neutral-950">
              Pick a Subtitle Style
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-[240px] mx-auto">
              Customize your captions in one click and export in HD.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 lg:px-6">
        <div className="rounded-3xl bg-brand-light p-8 sm:p-25 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-start-4 lg:col-end-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 max-w-[240px] leading-snug">
              Built for busy content creators
            </h2>
          </div>

          <div className="lg:col-start-7 lg:col-end-12 space-y-4">
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 flex items-start gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
              >
                <div className="w-11 h-11 rounded-full bg-[#5E95BE] text-white flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-md mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 leading-snug">
            Start for free, upgrade when you stream more
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 transition-all ${
                plan.featured
                  ? "bg-brand text-white shadow-xl lg:py-15 lg:-my-4 "
                  : "bg-brand-light text-black border border-silver-light"
              }`}
            >
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p
                  className={`text-sm min-h-[32px] ${
                    plan.featured ? "text-white" : "text-black"
                  }`}
                >
                  {plan.subtitle}
                </p>
              </div>

              <div className="mt-5 mb-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight">
                  {plan.price}
                </span>
                <span
                  className={`text-sm font-medium ${
                    plan.featured ? "text-white/80" : "text-neutral-500"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              <Link
                href={plan.href}
                className={`block text-center py-2.5 rounded-lg text-sm font-regular transition-colors ${
                  plan.featured
                    ? "bg-white text-black hover:bg-neutral-100"
                    : "bg-brand text-white hover:bg-[#4F85AE]"
                }`}
              >
                {plan.cta}
              </Link>

              <div
                className={`my-6 border-t ${
                  plan.featured ? "border-white/25" : "border-silver-light"
                }`}
              />

              <ul className="space-y-3">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        plan.featured ? "text-white" : "text-black"
                      }`}
                    />
                    <span
                      className={plan.featured ? "text-white/95" : "text-black"}
                    >
                      {perk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

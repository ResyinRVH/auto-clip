"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Scissors, Brush } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Clip",
    href: "/clip",
    icon: Scissors,
  },
  {
    label: "Remove Background",
    href: "/remove-bg",
    icon: Brush,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-[calc(100vh-2rem)] bg-[#F9F9FB] border border-neutral-200/70 rounded-r-3xl p-6 flex flex-col justify-between select-none">
      <div className="space-y-10">
        <div className="flex items-center gap-3.5 px-2">
          <div className="w-12 h-12 rounded-full bg-neutral-950 flex items-center justify-center text-white text-[11px] font-semibold tracking-wider shadow-sm">
            <Scissors/>
          </div>
          <span className="text-2xl font-bold tracking-tight text-neutral-900">
            Creator Studio
          </span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium ${
                  isActive
                    ? "bg-white text-neutral-900 border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/40"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-neutral-950 stroke-[2.2]" : "text-neutral-500 stroke-[1.8]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-2 text-xs text-neutral-400 font-medium">
        v1.0.0
      </div>
    </aside>
  );
}
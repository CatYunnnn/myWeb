/* Left rail navigation inspired by portfolio mock */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Articles", href: "/articles" },
  { label: "About", href: "/about" },
];

const socials = [
  { label: "LinkedIn", abbr: "in", href: "#" },
  { label: "Twitter", abbr: "tw", href: "#" },
  { label: "GitHub", abbr: "gh", href: "#" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="relative flex w-56 shrink-0 flex-col justify-between border-r border-[#1c2430] bg-[#0f1319] px-6 py-10 shadow-[8px_0_30px_-18px_rgba(0,0,0,0.7)]">
      <div className="space-y-10">
        <div className="text-3xl font-black tracking-tight text-amber-300">
          Y.L
        </div>

        <nav className="space-y-3">
          {links.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition"
              >
                <span
                  className={`absolute left-[-14px] h-8 w-1 rounded-full transition-all ${
                    active
                      ? "bg-amber-300 shadow-[0_0_12px_3px_rgba(255,193,94,0.5)]"
                      : "bg-transparent group-hover:bg-slate-500/60"
                  }`}
                />
                <span
                  className={`${
                    active
                      ? "text-amber-200"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 text-slate-400">
        {socials.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1f2a36] bg-[#121821] text-xs uppercase tracking-wide transition hover:border-amber-300 hover:text-amber-200 hover:shadow-[0_0_15px_-4px_rgba(255,193,94,0.5)]"
          >
            {item.abbr}
          </Link>
        ))}
      </div>
    </aside>
  );
};

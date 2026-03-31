/* Left rail navigation inspired by portfolio mock */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

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
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col justify-between border-r border-border bg-card px-6 py-10 shadow-[8px_0_30px_-18px_rgba(0,0,0,0.05)] transition-colors duration-500 dark:shadow-[8px_0_30px_-18px_rgba(0,0,0,0.7)]">
      <div className="space-y-10">
        <div className="text-3xl font-black tracking-tight text-accent transition-colors duration-500">
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
                className="group relative flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
              >
                <span
                  className={`absolute left-[-14px] h-8 w-1 rounded-full transition-all ${
                    active
                      ? "bg-accent shadow-[0_0_12px_3px_var(--glow-accent)]"
                      : "bg-transparent group-hover:bg-muted/40"
                  }`}
                />
                <span
                  className={`${
                    active
                      ? "text-accent"
                      : "text-muted group-hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 text-muted">
          {socials.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-xs uppercase tracking-wide transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_15px_-4px_var(--glow-accent)]"
            >
              {item.abbr}
            </Link>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
};

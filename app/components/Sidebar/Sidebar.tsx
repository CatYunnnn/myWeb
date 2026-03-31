/* Left rail navigation inspired by portfolio mock */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { ChevronLeft, ChevronRight } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
];

const socials = [
  { label: "LinkedIn", abbr: "in", href: "#" },
  { label: "Twitter", abbr: "tw", href: "#" },
  { label: "GitHub", abbr: "gh", href: "#" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (pathname === '/game') {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [pathname]);

  return (
    <aside className={`sticky top-0 z-[100] flex h-[100dvh] shrink-0 flex-col justify-between border-r border-border bg-card shadow-[8px_0_30px_-18px_rgba(0,0,0,0.05)] transition-all duration-300 dark:shadow-[8px_0_30px_-18px_rgba(0,0,0,0.7)] ${isCollapsed ? 'w-16 px-2 py-8' : 'w-56 px-6 py-10'} relative`}>
      
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-md transition-all hover:border-accent hover:text-accent z-50 text-muted hover:shadow-[0_0_15px_-5px_var(--glow-accent)]"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className={`space-y-10 ${isCollapsed ? 'items-center flex flex-col' : ''}`}>
        <div className={`font-black tracking-tight text-accent transition-colors duration-500 ${isCollapsed ? 'text-2xl mt-4' : 'text-3xl'}`}>
          Y.L
        </div>

        <nav className="space-y-3 flex flex-col w-full">
          {links.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex items-center rounded-full transition hover:text-foreground ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2 text-sm font-medium text-muted'}`}
              >
                <span
                  className={`absolute left-[-14px] w-1 rounded-full transition-all ${
                    active
                      ? "bg-accent shadow-[0_0_12px_3px_var(--glow-accent)]"
                      : "bg-transparent group-hover:bg-muted/40"
                  } ${isCollapsed ? 'h-6 left-0 rounded-l-none' : 'h-8'}`}
                />
                <span
                  className={`${
                    active
                      ? "text-accent"
                      : "text-muted group-hover:text-foreground"
                  } ${isCollapsed ? 'text-xs uppercase font-bold tracking-widest origin-center rotate-[-90deg] whitespace-nowrap mt-4 mb-4' : ''}`}
                >
                  {isCollapsed ? item.label.substring(0, 3) : item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* footer */}
      <div className={`flex items-center ${isCollapsed ? 'flex-col gap-4' : 'gap-2'}`}>
        {!isCollapsed && (
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
        )}
        <ThemeToggle />
      </div>
    </aside>
  );
};

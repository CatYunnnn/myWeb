"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

const navItems: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
];

export const Navbar = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-neutral-800">
      {/* Title name */}
      <div className="font-bold">Y.L</div>

      {/* Route */}
      <nav className="flex gap-6">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                active
                  ? "text-white border-b-2 border-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Theme switcher */}
      <div className="text-neutral-400">🌙</div>
    </header>
  );
};

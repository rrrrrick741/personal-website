"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "首页" },
  { href: "/focus", label: "专注" },
  { href: "/english", label: "英语" },
  { href: "/news", label: "新闻" },
  { href: "/github", label: "GitHub" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[--color-border] bg-[--color-bg]/85 backdrop-blur-xl">
      <nav className="page-shell h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold text-[--color-text] no-underline hover:text-[--color-accent] transition-colors"
        >
          <span className="h-2 w-2 rounded-full bg-[--color-accent]" />
          Rick
        </Link>
        <ul className="flex items-center gap-1 list-none m-0 p-0">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`rounded-full px-3 py-1.5 text-sm no-underline transition-colors ${
                  pathname === href
                    ? "bg-[--color-surface-muted] text-[--color-text] font-medium"
                    : "text-[--color-text-secondary] hover:bg-[--color-surface-muted] hover:text-[--color-text]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

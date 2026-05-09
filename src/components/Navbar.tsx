"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "首页" },
  { href: "/focus", label: "专注" },
  { href: "/english", label: "英语" },
  { href: "/news", label: "新闻" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[--color-border] bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-[--color-text] no-underline hover:text-[--color-text-secondary] transition-colors"
        >
          Rick
        </Link>
        <ul className="flex items-center gap-5 list-none m-0 p-0">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm tracking-wide no-underline transition-colors ${
                  pathname === href
                    ? "text-[--color-text] font-medium"
                    : "text-[--color-text-secondary] hover:text-[--color-text]"
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

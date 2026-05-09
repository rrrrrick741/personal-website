"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/learning", label: "Learning" },
  { href: "/news", label: "News" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[--color-border]">
      <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[--color-text] no-underline"
        >
          Rick
        </Link>
        <ul className="flex items-center gap-8 list-none m-0 p-0">
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/rates", label: "Rates" },
  { href: "/leagues", label: "Leagues" },
  { href: "/parties", label: "Parties" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(11,28,34,0.78)] backdrop-blur-md">
      <div className="mx-auto flex w-[min(1120px,calc(100%-1.5rem))] items-center justify-between gap-4 py-3">
        <Link href="/" className="display text-lg tracking-[0.14em] text-cream sm:text-xl">
          Cityview Lanes
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm uppercase tracking-[0.14em] transition-colors ${
                  active ? "text-signal" : "text-mist/80 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a href="tel:8173460444" className="btn btn-primary text-xs">
            Call to Bowl
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-cream md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-3 bg-current" />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--line)] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm uppercase tracking-[0.14em] text-mist"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a href="tel:8173460444" className="btn btn-primary mt-2 text-xs">
              Call to Bowl
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

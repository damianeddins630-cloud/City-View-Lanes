"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";
import type { PublicUser } from "@/lib/types";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null));
  }, [pathname]);

  const isAdmin = Boolean(user?.permissions?.includes("view_admin"));

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/75 shadow-[0_8px_30px_rgba(7,31,56,0.06)] backdrop-blur-2xl">
      <div className="silver-bar" />
      <div className="mx-auto flex w-[min(1140px,calc(100%-1.5rem))] items-center justify-between gap-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/images/cityview-logo.webp"
            alt="CityView Lanes logo"
            width={44}
            height={44}
            className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <span className="font-display text-xl tracking-[0.08em] text-[var(--navy)] uppercase sm:text-2xl">
            CityView Lanes
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide uppercase transition-colors ${
                  active
                    ? "text-[var(--blue)]"
                    : "text-[var(--ink)]/70 hover:text-[var(--navy)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm font-semibold tracking-wide text-[var(--ink)]/70 uppercase hover:text-[var(--navy)]"
              >
                Profile
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="text-sm font-semibold tracking-wide text-[var(--blue)] uppercase"
                >
                  Admin
                </Link>
              ) : null}
            </>
          ) : (
            <Link href="/login" className="btn btn-primary text-xs">
              Member Login
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border border-[var(--line)] text-[var(--navy)] lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-3 bg-current" />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--line)] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-1 text-sm font-semibold tracking-wide text-[var(--ink)] uppercase"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href={user ? "/profile" : "/login"} onClick={() => setOpen(false)}>
              {user ? "Profile" : "Member Login"}
            </Link>
            {isAdmin ? (
              <Link href="/admin" onClick={() => setOpen(false)}>
                Admin
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

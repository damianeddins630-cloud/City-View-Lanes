"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { canAccessAdminPanel } from "@/lib/permissions";
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

  const isAdmin = canAccessAdminPanel(user);

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="silver-bar" />
      <div className="mx-auto flex w-[min(1160px,calc(100%-1.5rem))] items-center justify-between gap-4 py-3.5">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/images/cityview-logo.webp"
            alt="CityView Lanes logo"
            width={48}
            height={48}
            className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <span className="font-display text-2xl font-semibold tracking-[0.08em] text-white uppercase sm:text-[1.7rem]">
            City View <span className="site-header-brand-accent">Lanes</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-link ${active ? "is-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <>
              <Link
                href="/profile"
                className={`site-nav-link ${pathname === "/profile" ? "is-active" : ""}`}
              >
                Profile
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className={`site-nav-link ${pathname === "/admin" ? "is-active" : ""}`}
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
          className="inline-flex h-10 w-10 items-center justify-center bg-white/10 text-white lg:hidden"
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
        <div className="site-header-mobile px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-1 text-sm font-semibold tracking-[0.12em] text-white uppercase"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={user ? "/profile" : "/login"}
              className="text-white"
              onClick={() => setOpen(false)}
            >
              {user ? "Profile" : "Member Login"}
            </Link>
            {isAdmin ? (
              <Link href="/admin" className="text-white" onClick={() => setOpen(false)}>
                Admin
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

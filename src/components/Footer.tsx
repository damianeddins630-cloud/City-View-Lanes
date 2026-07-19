import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/40 bg-[#8b949e] text-[var(--ink)]">
      <div className="mx-auto grid w-[min(1140px,calc(100%-1.5rem))] gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/cityview-logo.webp"
              alt="CityView Lanes logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain brightness-110"
            />
            <p className="font-display text-2xl tracking-[0.08em] uppercase">
              {SITE.name}
            </p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {SITE.tagline}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
            Visit
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {SITE.addressLine1}
            <br />
            {SITE.addressLine2}
          </p>
          <a
            href={`tel:${SITE.phoneTel}`}
            className="mt-3 inline-block text-sm font-semibold text-[var(--blue)]"
          >
            {SITE.phoneDisplay}
          </a>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
            Explore
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">
            {NAV.filter((n) => n.href !== "/").map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link href="/login">Member Login</Link>
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
            Follow
          </p>
        </div>
      </div>
      <div className="border-t border-white/35 py-4 text-center text-xs tracking-[0.08em] text-[var(--muted)]">
        © {new Date().getFullYear()} CityView Lanes. All rights reserved.
      </div>
    </footer>
  );
}

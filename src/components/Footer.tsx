import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="silver-bar" />
      <div className="mx-auto grid w-[min(1160px,calc(100%-1.5rem))] gap-12 py-14 md:grid-cols-[1.45fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/cityview-logo.webp"
              alt="CityView Lanes logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <p className="font-display text-3xl font-semibold tracking-[0.06em] uppercase">
              {SITE.name}
            </p>
          </div>
          <p className="site-footer-muted mt-5 max-w-md text-[0.95rem] leading-relaxed">
            {SITE.tagline}
          </p>
        </div>

        <div>
          <p className="site-footer-kicker text-[0.7rem] font-bold tracking-[0.2em] uppercase">
            Visit
          </p>
          <p className="site-footer-muted mt-3 text-sm leading-relaxed">
            {SITE.addressLine1}
            <br />
            {SITE.addressLine2}
          </p>
          <a
            href={`tel:${SITE.phoneTel}`}
            className="phone-link mt-4 inline-block text-base font-semibold text-[var(--ice-accent)]"
          >
            {SITE.phoneDisplay}
          </a>
        </div>

        <div>
          <p className="site-footer-kicker text-[0.7rem] font-bold tracking-[0.2em] uppercase">
            Explore
          </p>
          <div className="site-footer-muted mt-3 flex flex-col gap-2.5 text-sm">
            {NAV.filter((n) => n.href !== "/").map((link) => (
              <Link key={link.href} href={link.href} className="site-footer-link">
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="site-footer-link">
              Member Login
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs tracking-wide text-white/70">
        © {new Date().getFullYear()} {SITE.name}. Fort Worth, TX.
      </div>
    </footer>
  );
}

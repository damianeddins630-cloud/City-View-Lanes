import Image from "next/image";
import Link from "next/link";
import SpotlightCards from "@/components/SpotlightCards";
import { REVIEWS, SITE } from "@/lib/site";

const MARQUEE = [
  "League Bowling",
  "Birthday Parties",
  "Corporate Events",
  "Hall of Fame Coaching",
  "Open Bowling Daily",
  "Ballard's Pro Shop",
];

export default function HomePage() {
  return (
    <>
      <section className="hero-stage relative isolate overflow-hidden bg-[var(--navy)] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/cityview-lanes.webp"
            alt="Bowling lanes at CityView Lanes"
            fill
            priority
            className="object-cover hero-pan"
            sizes="100vw"
          />
        </div>
        <div className="hero-veil absolute inset-0" />
        <div className="hero-dots pointer-events-none absolute inset-0" />
        <div className="hero-swoosh pointer-events-none absolute inset-0" />
        <div className="hero-shine pointer-events-none absolute inset-0" />
        <div className="lane-pulse pointer-events-none absolute inset-x-0 bottom-0 h-44" />

        <div className="relative z-10 mx-auto flex min-h-[94svh] w-[min(1140px,calc(100%-1.5rem))] flex-col justify-end pb-16 pt-28 sm:pb-20">
          <div className="fade-up mb-5 flex items-center gap-3">
            <span className="brand-star" aria-hidden />
            <div className="silver-bar max-w-[140px]" />
          </div>
          <h1 className="font-display brand-title fade-up text-[clamp(4.8rem,14vw,9.5rem)] leading-[0.82] tracking-[0.04em] text-white">
            CityView
            <span className="brand-title-accent block">Lanes</span>
          </h1>
          <p className="fade-up-delay mt-6 max-w-xl text-lg text-white/93 sm:text-xl">
            Fort Worth bowling, leagues, and Hall of Fame coaching — under one
            roof.
          </p>
          <div className="fade-up-delay-2 mt-10 flex flex-wrap gap-3">
            <Link href="/hours" className="btn btn-hero-primary btn-pulse">
              See Hours
            </Link>
            <Link href="/pro-shop" className="btn btn-hero-light">
              Visit the Pro Shop
            </Link>
            <Link href="/book" className="btn btn-hero-outline">
              Book a Party
            </Link>
          </div>
        </div>
      </section>

      <div className="marquee-wrap border-y border-[var(--line)] bg-[var(--navy)] text-white">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={`${item}-${i}`} className="marquee-item">
              {item}
              <span className="marquee-dot" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <section className="section">
        <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
          Why CityView Lanes
        </p>
        <h2 className="font-display mt-2 text-4xl tracking-[0.05em] text-[var(--navy)] sm:text-6xl">
          Built for every kind of bowler.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          League nights, birthday parties, corporate events, and open bowling —
          with a Hall of Fame pro shop right on site.
        </p>
        <SpotlightCards />
      </section>

      <section className="relative overflow-hidden border-y border-[var(--line)] academy-band">
        <div className="section grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
              Hall of Fame Coaching
            </p>
            <h2 className="font-display mt-2 text-4xl tracking-[0.05em] text-[var(--navy)] sm:text-6xl">
              Ballard&apos;s Bowling Academy
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
              Owned by Del Ballard Jr. and Carolyn Dorin-Ballard — 33 combined
              PBA &amp; PWBA titles, four Hall of Fame inductions, and one pro
              shop inside CityView Lanes.
            </p>
            <Link href="/pro-shop" className="btn btn-primary mt-6">
              Meet the coaches
            </Link>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="stat-chip interactive-row">
                <p className="font-display text-5xl text-[var(--blue)]">33</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Combined PBA + PWBA titles
                </p>
              </div>
              <div className="stat-chip interactive-row">
                <p className="font-display text-5xl text-[var(--blue)]">4</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Hall of Fame inductions
                </p>
              </div>
            </div>
          </div>
          <div className="media-frame media-frame-glow relative min-h-[380px] overflow-hidden">
            <Image
              src="/images/cityview-interior.webp"
              alt="Inside CityView Lanes"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
          Inside the Center
        </p>
        <h2 className="font-display mt-2 text-4xl tracking-[0.05em] text-[var(--navy)] sm:text-6xl">
          The lanes in real life
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
          Real photos from CityView Lanes — more official gallery shots coming
          soon.
        </p>
        <div className="gallery-mosaic mt-8">
          {[
            "/images/yelp-lanes-kids.jpg",
            "/images/yelp-interior-1.jpg",
            "/images/yelp-interior-2.jpg",
          ].map((src, index) => (
            <div
              key={src}
              className={`gallery-tile relative overflow-hidden bg-[var(--blue-soft)] mosaic-${index + 1}`}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <Image
                src={src}
                alt="CityView Lanes guest photo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[var(--line)] bg-[var(--navy)] text-white">
        <div className="reviews-glow pointer-events-none absolute inset-0" />
        <div className="section relative z-10">
          <p className="text-sm font-bold tracking-[0.18em] text-[var(--silver)] uppercase">
            Loved locally
          </p>
          <h2 className="font-display mt-2 text-4xl tracking-[0.05em] sm:text-6xl">
            What bowlers say
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {REVIEWS.map((review, index) => (
              <blockquote
                key={review.name}
                className="fade-up quote-block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-base leading-relaxed text-white/90">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <footer className="mt-5">
                  <p className="font-bold text-white">{review.name}</p>
                  <p className="text-xs tracking-wide text-[var(--silver)] uppercase">
                    {review.role}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="visit-band relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/cityview-lanes.webp"
            alt=""
            fill
            className="object-cover opacity-35"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(242,246,251,0.96)_0%,rgba(232,241,251,0.9)_55%,rgba(255,255,255,0.78)_100%)]" />
        <div className="section relative z-10">
          <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
            Come visit
          </p>
          <div className="mt-4 grid gap-8 md:grid-cols-[1.25fr_1fr] md:items-end">
            <div>
              <h2 className="font-display text-5xl tracking-[0.05em] text-[var(--navy)] sm:text-6xl">
                {SITE.addressLine1}
              </h2>
              <p className="mt-2 text-lg text-[var(--muted)]">{SITE.addressLine2}</p>
              <a
                href={`tel:${SITE.phoneTel}`}
                className="phone-link mt-5 inline-block text-3xl font-bold tracking-wide text-[var(--blue)]"
              >
                {SITE.phoneDisplay}
              </a>
              <p className="mt-4 text-sm text-[var(--ink)]">
                Open daily 12:00 PM – 12:00 AM
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">Free parking on-site</p>
            </div>
            <div className="flex flex-wrap content-start gap-3">
              <Link href="/leagues" className="btn btn-hero-primary">
                Join a league
              </Link>
              <Link href="/book" className="btn btn-primary">
                Book a party
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

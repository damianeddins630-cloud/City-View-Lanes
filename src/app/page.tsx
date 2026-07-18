import Image from "next/image";
import Link from "next/link";
import { REVIEWS, SITE, WHY_CARDS } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-[var(--line)] bg-[var(--navy)] text-white">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/cityview-lanes.webp"
            alt="Bowling lanes at CityView Lanes"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(11,42,74,0.92)_0%,rgba(11,42,74,0.72)_55%,rgba(31,94,168,0.55)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88svh] w-[min(1140px,calc(100%-1.5rem))] flex-col justify-end pb-16 pt-28">
          <div className="fade-up silver-bar mb-5 max-w-[140px]" />
          <p className="fade-up text-sm font-bold tracking-[0.22em] text-[var(--silver)] uppercase">
            Fort Worth, Texas
          </p>
          <h1 className="font-display fade-up mt-3 text-6xl leading-none tracking-[0.06em] sm:text-8xl">
            CityView Lanes
          </h1>
          <p className="fade-up-delay mt-5 max-w-2xl text-lg text-white/85 sm:text-xl">
            Fort Worth&apos;s Home for Bowling, Leagues &amp; Hall of Fame
            Coaching.
          </p>
          <div className="fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Link href="/hours" className="btn btn-primary">
              See Hours
            </Link>
            <Link href="/pro-shop" className="btn btn-ghost !border-white/30 !bg-white/10 !text-white">
              Visit the Pro Shop
            </Link>
            <Link href="/book" className="btn btn-ghost !border-white/30 !bg-white/10 !text-white">
              Book a Party
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
          Why CityView Lanes
        </p>
        <h2 className="font-display mt-2 text-4xl tracking-[0.05em] text-[var(--navy)] sm:text-5xl">
          A modern bowling experience.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          From competitive leagues to family birthdays, every visit is designed
          to feel polished, welcoming, and unmistakably Fort Worth.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CARDS.map((card) => (
            <article
              key={card.title}
              className="panel p-5 transition-transform hover:-translate-y-1"
            >
              <h3 className="font-display text-2xl tracking-[0.04em] text-[var(--navy)]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {card.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white">
        <div className="section grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
              Hall of Fame Coaching
            </p>
            <h2 className="font-display mt-2 text-4xl tracking-[0.05em] text-[var(--navy)] sm:text-5xl">
              Ballard&apos;s Bowling Academy
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
              Owned by Del Ballard Jr. and Carolyn Dorin-Ballard — 33 combined
              PBA &amp; PWBA titles, four Hall of Fame inductions, and one pro
              shop right inside CityView Lanes.
            </p>
            <Link href="/pro-shop" className="btn btn-primary mt-6">
              Meet the coaches
            </Link>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="border border-[var(--line)] p-4">
                <p className="font-display text-4xl text-[var(--blue)]">33</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Combined PBA + PWBA titles
                </p>
              </div>
              <div className="border border-[var(--line)] p-4">
                <p className="font-display text-4xl text-[var(--blue)]">4</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Hall of Fame inductions
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--ink)]">
              Custom ball drilling · Private coaching · Elite equipment
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              One-on-one lessons available by appointment.
            </p>
          </div>
          <div className="relative min-h-[320px] overflow-hidden border border-[var(--line)]">
            <Image
              src="/images/cityview-interior.webp"
              alt="Inside CityView Lanes"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
          Inside the Center
        </p>
        <h2 className="font-display mt-2 text-4xl tracking-[0.05em] text-[var(--navy)]">
          Photo gallery
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
          Official CityView Lanes photography coming soon — owner: upload
          authentic photos in the admin panel.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            "/images/yelp-lanes-kids.jpg",
            "/images/yelp-interior-1.jpg",
            "/images/yelp-interior-2.jpg",
          ].map((src) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden border border-[var(--line)] bg-[var(--blue-soft)]"
            >
              <Image
                src={src}
                alt="Real CityView Lanes guest photo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--blue-soft)]">
        <div className="section">
          <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
            Loved locally
          </p>
          <h2 className="font-display mt-2 text-4xl tracking-[0.05em] text-[var(--navy)]">
            What bowlers say
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((review) => (
              <blockquote
                key={review.name}
                className="border border-[var(--line)] bg-white p-5"
              >
                <p className="text-sm leading-relaxed text-[var(--ink)]">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <footer className="mt-4">
                  <p className="font-bold text-[var(--navy)]">{review.name}</p>
                  <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                    {review.role}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
          Come visit
        </p>
        <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-display text-4xl tracking-[0.05em] text-[var(--navy)]">
              {SITE.addressLine1}
            </h2>
            <p className="mt-2 text-lg text-[var(--muted)]">{SITE.addressLine2}</p>
            <a
              href={`tel:${SITE.phoneTel}`}
              className="mt-4 inline-flex items-center gap-2 text-xl font-bold text-[var(--blue)]"
            >
              <span aria-hidden>📞</span> {SITE.phoneDisplay}
            </a>
            <p className="mt-4 text-sm text-[var(--ink)]">
              Open daily 12:00 PM – 12:00 AM
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">Free parking on-site</p>
          </div>
          <div className="flex flex-wrap content-start gap-3">
            <Link href="/leagues" className="btn btn-primary">
              Join a league
            </Link>
            <Link href="/book" className="btn btn-ghost">
              Book a party
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

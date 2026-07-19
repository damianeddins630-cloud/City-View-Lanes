import Link from "next/link";
import SiteImage from "@/components/SiteImage";
import SpotlightCards from "@/components/SpotlightCards";
import { readStore } from "@/lib/db";
import { ensureSiteContent } from "@/lib/siteContent";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStore();
  const content = ensureSiteContent(store.siteContent);
  const h = content.home;
  const marquee = [...h.marquee, ...h.marquee];

  return (
    <>
      <section className="hero-stage relative isolate overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <SiteImage
            src={h.heroImage}
            alt={h.heroImageAlt}
            fill
            priority
            className="object-cover hero-pan"
            sizes="100vw"
          />
        </div>
        <div className="hero-veil absolute inset-0" />
        <div className="hero-dots pointer-events-none absolute inset-0" />
        <div className="hero-swoosh pointer-events-none absolute inset-0" />
        <div className="hero-beam pointer-events-none absolute inset-0" />
        <div className="hero-shine pointer-events-none absolute inset-0" />
        <div className="lane-pulse pointer-events-none absolute inset-x-0 bottom-0 h-52" />
        <div className="neon-ring pointer-events-none absolute -right-24 top-1/4 h-80 w-80" />

        <div className="relative z-10 mx-auto flex min-h-[96svh] w-[min(1140px,calc(100%-1.5rem))] flex-col justify-end pb-16 pt-28 sm:pb-20">
          <div className="fade-up mb-6 flex items-center gap-3">
            <span className="brand-star brand-star-lg" aria-hidden />
            <div className="silver-bar max-w-[180px]" />
          </div>
          <h1 className="font-display brand-title fade-up text-[clamp(5.2rem,15vw,10rem)] leading-[0.8] tracking-[0.03em] text-white">
            {h.heroTitleLine1}
            <span className="brand-title-accent block">{h.heroTitleLine2}</span>
          </h1>
          <p className="fade-up-delay mt-6 max-w-xl text-xl text-white sm:text-2xl">
            {h.heroSubtitle}
          </p>
          <div className="fade-up-delay-2 mt-10 flex flex-wrap gap-3">
            <Link href="/hours" className="btn btn-hero-primary btn-pulse btn-xl">
              See Hours
            </Link>
            <Link href="/pro-shop" className="btn btn-hero-light btn-xl">
              Visit the Pro Shop
            </Link>
            <Link href="/book" className="btn btn-hero-outline btn-xl">
              Book a Party
            </Link>
          </div>
        </div>
      </section>

      <div className="marquee-wrap border-y border-[var(--line)] bg-[var(--navy)] text-white">
        <div className="marquee-track">
          {marquee.map((item, i) => (
            <span key={`${item}-${i}`} className="marquee-item">
              {item}
              <span className="marquee-dot" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <section className="section">
        <p className="section-kicker">{h.whyKicker}</p>
        <h2 className="font-display section-title mt-2 text-4xl tracking-[0.05em] text-white sm:text-6xl">
          {h.whyTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          {h.whyCopy}
        </p>
        <SpotlightCards cards={h.whyCards} />
      </section>

      <section className="relative overflow-hidden border-y border-[var(--line)] academy-band">
        <div className="section grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="section-kicker">{h.academyKicker}</p>
            <h2 className="font-display section-title mt-2 text-4xl tracking-[0.05em] text-white sm:text-6xl">
              {h.academyTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
              {h.academyCopy}
            </p>
            <Link href="/pro-shop" className="btn btn-primary mt-6">
              Meet the coaches
            </Link>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="stat-chip interactive-row">
                <p className="font-display text-5xl text-[var(--blue)]">
                  {h.academyStat1Value}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {h.academyStat1Label}
                </p>
              </div>
              <div className="stat-chip interactive-row">
                <p className="font-display text-5xl text-[var(--blue)]">
                  {h.academyStat2Value}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {h.academyStat2Label}
                </p>
              </div>
            </div>
          </div>
          <div className="media-frame media-frame-glow relative min-h-[380px] overflow-hidden">
            <SiteImage
              src={h.academyImage}
              alt={h.academyImageAlt}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
          {h.galleryKicker}
        </p>
        <h2 className="font-display mt-2 text-4xl tracking-[0.05em] text-white sm:text-6xl">
          {h.galleryTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">{h.galleryCopy}</p>
        <div className="gallery-mosaic mt-8">
          {h.galleryImages.map((img, index) => (
            <div
              key={`${img.src}-${index}`}
              className={`gallery-tile relative overflow-hidden bg-[var(--blue-soft)] mosaic-${index + 1}`}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <SiteImage
                src={img.src}
                alt={img.alt}
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
            {h.reviewsKicker}
          </p>
          <h2 className="font-display mt-2 text-4xl tracking-[0.05em] sm:text-6xl">
            {h.reviewsTitle}
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {h.reviews.map((review, index) => (
              <blockquote
                key={`${review.name}-${index}`}
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
          <SiteImage
            src={h.visitImage}
            alt=""
            fill
            className="object-cover opacity-35"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,7,12,0.94)_0%,rgba(10,18,32,0.9)_55%,rgba(5,7,12,0.86)_100%)]" />
        <div className="section relative z-10">
          <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue-bright)] uppercase">
            {h.visitKicker}
          </p>
          <div className="mt-4 grid gap-8 md:grid-cols-[1.25fr_1fr] md:items-end">
            <div>
              <h2 className="font-display text-5xl tracking-[0.05em] text-white sm:text-6xl">
                {SITE.addressLine1}
              </h2>
              <p className="mt-2 text-lg text-[var(--muted)]">{SITE.addressLine2}</p>
              <a
                href={`tel:${SITE.phoneTel}`}
                className="phone-link mt-5 inline-block text-3xl font-bold tracking-wide text-[var(--blue-bright)]"
              >
                {SITE.phoneDisplay}
              </a>
              <p className="mt-4 text-sm text-white">{h.visitHoursNote}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{h.visitParkingNote}</p>
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

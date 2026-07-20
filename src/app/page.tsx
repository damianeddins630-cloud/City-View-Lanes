import Link from "next/link";
import EditableImage from "@/components/EditableImage";
import EditableText from "@/components/EditableText";
import SpotlightCards from "@/components/SpotlightCards";
import { readStore } from "@/lib/db";
import { resolveEditValue } from "@/lib/contentPath";
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
      <section className="hero-stage relative isolate overflow-hidden bg-[var(--ink)] text-white">
        <div className="absolute inset-0">
          <EditableImage
            path="home.heroImage"
            src={h.heroImage}
            alt={h.heroImageAlt}
            fill
            priority
            className="object-cover hero-gif-feel"
            sizes="100vw"
          />
        </div>
        <div className="hero-veil absolute inset-0" />
        <div className="hero-lane-glow pointer-events-none absolute inset-0" />
        <div className="hero-shine pointer-events-none absolute inset-0" />
        <div className="lane-pulse pointer-events-none absolute inset-x-0 bottom-0 h-52" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-[min(1160px,calc(100%-1.5rem))] flex-col justify-end pb-20 pt-28 sm:pb-24">
          <h1 className="font-display brand-title-row fade-up text-[clamp(2.6rem,8vw,5.8rem)] font-semibold leading-none tracking-[0.04em] uppercase">
            <span className="lane-neon-text">
              <EditableText path="home.heroTitleLine1" value={h.heroTitleLine1} />
              {" "}
              <EditableText path="home.heroTitleLine2" value={h.heroTitleLine2} />
            </span>
          </h1>
          <EditableText
            path="home.heroSubtitle"
            value={h.heroSubtitle}
            as="p"
            multiline
            className="fade-up-delay mt-7 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl"
          />
          <div className="fade-up-delay-2 mt-10 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-hero-primary btn-xl">
              Book a Party
            </Link>
            <Link href="/leagues" className="btn btn-hero-light btn-xl">
              Join a League
            </Link>
          </div>
        </div>
      </section>

      <div className="marquee-wrap border-y border-[var(--line)]">
        <div className="marquee-track">
          {marquee.map((item, i) => (
            <span key={`${item}-${i}`} className="marquee-item">
              {i < h.marquee.length ? (
                <EditableText path={`home.marquee.${i}`} value={item} />
              ) : (
                item
              )}
              <span className="marquee-dot" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <section className="lanes-status-band" aria-label="Lane availability and pricing">
        <div className="section py-8 sm:py-10">
          <div className="lanes-status-grid">
            <div
              className={`lanes-status-block ${
                h.lanesAvailable ? "is-open" : "is-full"
              }`}
            >
              <EditableText
                path="home.lanesStatusLabel"
                value={h.lanesStatusLabel}
                as="p"
                className="text-[10px] font-bold tracking-[0.18em] text-[var(--blue)] uppercase"
              />
              <EditableText
                path={
                  h.lanesAvailable
                    ? "home.lanesAvailableText"
                    : "home.lanesUnavailableText"
                }
                value={
                  h.lanesAvailable ? h.lanesAvailableText : h.lanesUnavailableText
                }
                as="p"
                className="font-display mt-2 text-3xl tracking-[0.04em] text-[var(--ink)] sm:text-4xl"
              />
              <EditableText
                path={
                  h.lanesAvailable
                    ? "edits.home.lanesHintOpen"
                    : "edits.home.lanesHintFull"
                }
                value={resolveEditValue(
                  content,
                  h.lanesAvailable
                    ? "edits.home.lanesHintOpen"
                    : "edits.home.lanesHintFull",
                  h.lanesAvailable
                    ? "Come bowl — open bowling lanes are open."
                    : "Check back soon or call the center for the next opening.",
                )}
                as="p"
                multiline
                className="mt-2 text-sm text-[var(--muted)]"
              />
            </div>
            <div className="lanes-status-block pricing">
              <EditableText
                path="home.pricingLabel"
                value={h.pricingLabel}
                as="p"
                className="text-[10px] font-bold tracking-[0.18em] text-[var(--blue)] uppercase"
              />
              <EditableText
                path="home.pricingValue"
                value={h.pricingValue || "N/A"}
                as="p"
                className="font-display mt-2 text-3xl tracking-[0.04em] text-[var(--ink)] sm:text-4xl"
              />
              <EditableText
                path="edits.home.pricingHint"
                value={resolveEditValue(
                  content,
                  "edits.home.pricingHint",
                  "Pricing details coming soon.",
                )}
                as="p"
                className="mt-2 text-sm text-[var(--muted)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <EditableText
          path="home.whyKicker"
          value={h.whyKicker}
          as="p"
          className="section-kicker"
        />
        <EditableText
          path="home.whyTitle"
          value={h.whyTitle}
          as="h2"
          className="font-display section-title mt-2 text-4xl tracking-[0.05em] text-[var(--ink)] sm:text-6xl"
        />
        <EditableText
          path="home.whyCopy"
          value={h.whyCopy}
          as="p"
          multiline
          className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]"
        />
        <SpotlightCards cards={h.whyCards} />
      </section>

      <section className="relative overflow-hidden border-y border-[var(--line)] academy-band">
        <div className="section grid items-center gap-10 md:grid-cols-2">
          <div>
            <EditableText
              path="home.academyKicker"
              value={h.academyKicker}
              as="p"
              className="section-kicker"
            />
            <EditableText
              path="home.academyTitle"
              value={h.academyTitle}
              as="h2"
              className="font-display section-title mt-2 text-4xl tracking-[0.05em] text-[var(--ink)] sm:text-6xl"
            />
            <EditableText
              path="home.academyCopy"
              value={h.academyCopy}
              as="p"
              multiline
              className="mt-4 text-base leading-relaxed text-[var(--muted)]"
            />
            <Link href="/pro-shop" className="btn btn-primary mt-6">
              Meet the coaches
            </Link>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="stat-chip interactive-row">
                <EditableText
                  path="home.academyStat1Value"
                  value={h.academyStat1Value}
                  as="p"
                  className="font-display text-5xl text-[var(--blue)]"
                />
                <EditableText
                  path="home.academyStat1Label"
                  value={h.academyStat1Label}
                  as="p"
                  className="mt-1 text-sm text-[var(--muted)]"
                />
              </div>
              <div className="stat-chip interactive-row">
                <EditableText
                  path="home.academyStat2Value"
                  value={h.academyStat2Value}
                  as="p"
                  className="font-display text-5xl text-[var(--blue)]"
                />
                <EditableText
                  path="home.academyStat2Label"
                  value={h.academyStat2Label}
                  as="p"
                  className="mt-1 text-sm text-[var(--muted)]"
                />
              </div>
            </div>
          </div>
          <div className="media-frame media-frame-glow relative min-h-[380px] overflow-hidden">
            <EditableImage
              path="home.academyImage"
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
        <EditableText
          path="home.galleryKicker"
          value={h.galleryKicker}
          as="p"
          className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase"
        />
        <EditableText
          path="home.galleryTitle"
          value={h.galleryTitle}
          as="h2"
          className="font-display mt-2 text-4xl tracking-[0.05em] text-[var(--ink)] sm:text-6xl"
        />
        <EditableText
          path="home.galleryCopy"
          value={h.galleryCopy}
          as="p"
          multiline
          className="mt-3 max-w-2xl text-sm text-[var(--muted)]"
        />
        <div className="gallery-mosaic mt-8">
          {h.galleryImages.map((img, index) => (
            <div
              key={`${img.src}-${index}`}
              className={`gallery-tile relative overflow-hidden bg-[var(--blue-soft)] mosaic-${index + 1}`}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <EditableImage
                path={`home.galleryImages.${index}.src`}
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                siblingPath={
                  index < h.galleryImages.length - 1
                    ? `home.galleryImages.${index + 1}.src`
                    : index > 0
                      ? `home.galleryImages.${index - 1}.src`
                      : undefined
                }
                siblingSrc={
                  index < h.galleryImages.length - 1
                    ? h.galleryImages[index + 1]?.src
                    : index > 0
                      ? h.galleryImages[index - 1]?.src
                      : undefined
                }
                deleteFallback="/images/cityview-lanes.webp"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="reviews-band relative overflow-hidden">
        <div className="reviews-glow pointer-events-none absolute inset-0" />
        <div className="section relative z-10">
          <EditableText
            path="home.reviewsKicker"
            value={h.reviewsKicker}
            as="p"
            className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase"
          />
          <EditableText
            path="home.reviewsTitle"
            value={h.reviewsTitle}
            as="h2"
            className="font-display mt-2 text-4xl tracking-[0.05em] sm:text-6xl"
          />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {h.reviews.map((review, index) => (
              <blockquote
                key={`${review.name}-${index}`}
                className="fade-up quote-block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <EditableText
                  path={`home.reviews.${index}.quote`}
                  value={review.quote}
                  as="p"
                  multiline
                  prefix="“"
                  suffix="”"
                  className="text-base leading-relaxed text-[var(--ink)]"
                />
                <footer className="mt-5">
                  <EditableText
                    path={`home.reviews.${index}.name`}
                    value={review.name}
                    as="p"
                    className="font-bold text-[var(--ink)]"
                  />
                  <EditableText
                    path={`home.reviews.${index}.role`}
                    value={review.role}
                    as="p"
                    className="text-xs tracking-wide text-[var(--muted)] uppercase"
                  />
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="visit-band relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <EditableImage
            path="home.visitImage"
            src={h.visitImage}
            alt=""
            fill
            className="object-cover opacity-35"
            sizes="100vw"
          />
        </div>
        <div className="visit-veil absolute inset-0" />
        <div className="section relative z-10 text-[var(--ice)]">
          <EditableText
            path="home.visitKicker"
            value={h.visitKicker}
            as="p"
            className="text-sm font-bold tracking-[0.18em] text-[var(--ice-accent)] uppercase"
          />
          <div className="mt-4 grid gap-8 md:grid-cols-[1.25fr_1fr] md:items-end">
            <div>
              <h2 className="font-display text-5xl tracking-[0.05em] text-white sm:text-6xl">
                {SITE.addressLine1}
              </h2>
              <p className="mt-2 text-lg text-white/75">{SITE.addressLine2}</p>
              <a
                href={`tel:${SITE.phoneTel}`}
                className="phone-link mt-5 inline-block text-3xl font-bold tracking-wide text-[var(--ice-accent)]"
              >
                {SITE.phoneDisplay}
              </a>
              <EditableText
                path="home.visitHoursNote"
                value={h.visitHoursNote}
                as="p"
                className="mt-4 text-sm text-white/90"
              />
              <EditableText
                path="home.visitParkingNote"
                value={h.visitParkingNote}
                as="p"
                className="mt-1 text-sm text-white/70"
              />
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

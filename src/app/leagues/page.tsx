import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import LeaguesClient from "@/components/LeaguesClient";
import { readStore } from "@/lib/db";
import { SITE, YOUTH_LEAGUE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leagues",
  description:
    "Adult, senior, youth, and IGBO league registration at CityView Lanes — Fort Worth.",
};

export const dynamic = "force-dynamic";

export default async function LeaguesPage() {
  const store = await readStore();

  return (
    <>
      <section className="league-hero relative isolate overflow-hidden text-white">
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
        <div className="hero-beam pointer-events-none absolute inset-0" />
        <div className="lane-pulse pointer-events-none absolute inset-x-0 bottom-0 h-40" />

        <div className="relative z-10 mx-auto flex min-h-[72svh] w-[min(1140px,calc(100%-1.5rem))] flex-col justify-end pb-14 pt-24">
          <div className="fade-up mb-4 flex items-center gap-3">
            <span className="brand-star" aria-hidden />
            <div className="silver-bar max-w-[140px]" />
          </div>
          <p className="fade-up section-kicker text-white/90">
            CityView Lanes · {SITE.fallSeasonLabel}
          </p>
          <h1 className="font-display fade-up mt-2 max-w-3xl text-[clamp(3.4rem,10vw,6.5rem)] leading-[0.88] tracking-[0.03em]">
            Leagues
            <span className="brand-title-accent block">that hit harder</span>
          </h1>
          <p className="fade-up-delay mt-5 max-w-xl text-lg text-white/90">
            Adult, senior, youth, and IGBO — weekly play in Fort Worth with a
            desk that actually answers the phone.
          </p>
          <div className="fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <a href="#schedule" className="btn btn-hero-primary">
              See schedule
            </a>
            <a href="#youth" className="btn btn-hero-light">
              Youth league
            </a>
            <a
              href={`tel:${SITE.leaguePhoneTel}`}
              className="btn btn-hero-outline"
            >
              Call {SITE.leaguePhoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <div className="marquee-wrap border-y border-[var(--line)]">
        <div className="marquee-track">
          {[
            "Adult",
            "Senior",
            "Youth",
            "IGBO",
            "Fall 2026",
            "Fort Worth",
            "Apply online",
            "Adult",
            "Senior",
            "Youth",
            "IGBO",
            "Fall 2026",
            "Fort Worth",
            "Apply online",
          ].map((item, i) => (
            <span key={`${item}-${i}`} className="marquee-item">
              {item}
              <span className="marquee-dot" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <section id="youth" className="youth-band relative overflow-hidden">
        <div className="section grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="fade-up">
            <p className="section-kicker">{YOUTH_LEAGUE.kicker}</p>
            <h2 className="font-display section-title mt-2 text-4xl tracking-[0.05em] text-white sm:text-6xl">
              {YOUTH_LEAGUE.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
              {YOUTH_LEAGUE.blurb}
            </p>
            <p className="mt-4 text-sm font-semibold tracking-wide text-white">
              {YOUTH_LEAGUE.ages} · {YOUTH_LEAGUE.season}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{YOUTH_LEAGUE.format}</p>

            <div className="youth-highlights mt-8">
              {YOUTH_LEAGUE.highlights.map((item) => (
                <div key={item.label} className="youth-highlight">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--blue-bright)] uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display text-2xl tracking-wide text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/leagues?join=1#schedule" className="btn btn-primary">
                Apply for youth
              </Link>
              <a href={`tel:${SITE.leaguePhoneTel}`} className="btn btn-ghost">
                {YOUTH_LEAGUE.phoneNote}
              </a>
            </div>
          </div>

          <div className="youth-photo-stack fade-up-delay">
            {YOUTH_LEAGUE.photos.map((photo, index) => (
              <div
                key={photo.src}
                className={`youth-photo youth-photo-${index + 1} relative overflow-hidden`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 48vw"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="section pt-0">
          <div className="youth-states-board fade-up">
            <div className="mb-6 max-w-2xl">
              <p className="section-kicker">Player states</p>
              <h3 className="font-display mt-2 text-3xl tracking-[0.05em] text-white sm:text-4xl">
                Where our youth players come from
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                CityView youth bowlers call Texas home — and our roster also
                reaches neighboring states for travel and tournament play.
              </p>
            </div>

            <div className="state-strip">
              {YOUTH_LEAGUE.playerStates.map((state) => (
                <div key={state.code} className="state-chip">
                  <p className="font-display text-4xl tracking-wide text-[var(--blue-bright)]">
                    {state.code}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {state.name}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-[var(--muted)]">
                    {state.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="youth-stats-row mt-8">
              {YOUTH_LEAGUE.playerStats.map((stat) => (
                <div key={stat.label} className="youth-stat">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--silver)] uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="section pt-10">
        <p className="section-kicker">Fall schedule</p>
        <h2 className="font-display section-title mt-2 text-4xl tracking-[0.05em] text-white sm:text-5xl">
          Pick a league. Apply in minutes.
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
          Sign in to submit a league application. Track Under review / Approved /
          Denied on your Profile. Questions? Call the league desk at{" "}
          {SITE.leaguePhoneDisplay}.
        </p>

        <Suspense
          fallback={
            <p className="mt-8 text-sm text-[var(--muted)]">Loading leagues…</p>
          }
        >
          <LeaguesClient initialLeagues={store.leagues} />
        </Suspense>
      </section>
    </>
  );
}

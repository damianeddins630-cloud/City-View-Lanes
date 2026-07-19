import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import EditableImage from "@/components/EditableImage";
import EditableText from "@/components/EditableText";
import LeaguesClient from "@/components/LeaguesClient";
import { resolveEditValue } from "@/lib/contentPath";
import { readStore } from "@/lib/db";
import { ensureSiteContent } from "@/lib/siteContent";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leagues",
  description:
    "Adult, senior, youth, and IGBO league registration at CityView Lanes — Fort Worth.",
};

export const dynamic = "force-dynamic";

export default async function LeaguesPage() {
  const store = await readStore();
  const content = ensureSiteContent(store.siteContent);
  const youth = content.youth;

  return (
    <>
      <section className="league-hero relative isolate overflow-hidden text-[var(--ink)]">
        <div className="absolute inset-0">
          <EditableImage
            path="youth.heroImage"
            src={youth.heroImage}
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
          <p className="fade-up section-kicker">
            CityView Lanes · {SITE.fallSeasonLabel}
          </p>
          <h1 className="font-display fade-up mt-2 max-w-3xl text-[clamp(3.4rem,10vw,6.5rem)] leading-[0.88] tracking-[0.03em] text-[var(--ink)]">
            <EditableText
              path="edits.leagues.heroTitle"
              value={resolveEditValue(content, "edits.leagues.heroTitle", "Leagues")}
            />
            <EditableText
              path="edits.leagues.heroAccent"
              value={resolveEditValue(
                content,
                "edits.leagues.heroAccent",
                "that hit harder",
              )}
              as="span"
              className="brand-title-accent block"
            />
          </h1>
          <EditableText
            path="edits.leagues.heroSubtitle"
            value={resolveEditValue(
              content,
              "edits.leagues.heroSubtitle",
              "Adult, senior, youth, and IGBO — weekly play in Fort Worth with a desk that actually answers the phone.",
            )}
            as="p"
            multiline
            className="fade-up-delay mt-5 max-w-xl text-lg text-[var(--muted)]"
          />
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
            <EditableText
              path="youth.kicker"
              value={youth.kicker}
              as="p"
              className="section-kicker"
            />
            <EditableText
              path="youth.title"
              value={youth.title}
              as="h2"
              className="font-display section-title mt-2 text-4xl tracking-[0.05em] text-[var(--ink)] sm:text-6xl"
            />
            <EditableText
              path="youth.blurb"
              value={youth.blurb}
              as="p"
              multiline
              className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]"
            />
            <p className="mt-4 text-sm font-semibold tracking-wide text-[var(--ink)]">
              <EditableText path="youth.ages" value={youth.ages} />
              {" · "}
              <EditableText path="youth.season" value={youth.season} />
            </p>
            <EditableText
              path="youth.format"
              value={youth.format}
              as="p"
              className="mt-2 text-sm text-[var(--muted)]"
            />

            <div className="youth-highlights mt-8">
              {youth.highlights.map((item, index) => (
                <div key={item.label} className="youth-highlight">
                  <EditableText
                    path={`youth.highlights.${index}.label`}
                    value={item.label}
                    as="p"
                    className="text-[10px] font-bold tracking-[0.18em] text-[var(--blue)] uppercase"
                  />
                  <EditableText
                    path={`youth.highlights.${index}.value`}
                    value={item.value}
                    as="p"
                    className="mt-1 font-display text-2xl tracking-wide text-[var(--ink)]"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/leagues?join=1#schedule" className="btn btn-primary">
                Apply for youth
              </Link>
              <a href={`tel:${SITE.leaguePhoneTel}`} className="btn btn-ghost">
                <EditableText path="youth.phoneNote" value={youth.phoneNote} />
              </a>
            </div>
          </div>

          <div className="youth-photo-stack fade-up-delay">
            {youth.photos.map((photo, index) => (
              <div
                key={`${photo.src}-${index}`}
                className={`youth-photo youth-photo-${index + 1} relative overflow-hidden`}
              >
                <EditableImage
                  path={`youth.photos.${index}.src`}
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
              <EditableText
                path="edits.leagues.statesKicker"
                value={resolveEditValue(
                  content,
                  "edits.leagues.statesKicker",
                  "Player states",
                )}
                as="p"
                className="section-kicker"
              />
              <EditableText
                path="edits.leagues.statesTitle"
                value={resolveEditValue(
                  content,
                  "edits.leagues.statesTitle",
                  "Where our youth players come from",
                )}
                as="h3"
                className="font-display mt-2 text-3xl tracking-[0.05em] text-[var(--ink)] sm:text-4xl"
              />
              <EditableText
                path="edits.leagues.statesCopy"
                value={resolveEditValue(
                  content,
                  "edits.leagues.statesCopy",
                  "CityView youth bowlers call Texas home — and our roster also reaches neighboring states for travel and tournament play.",
                )}
                as="p"
                multiline
                className="mt-3 text-sm leading-relaxed text-[var(--muted)]"
              />
            </div>

            <div className="state-strip">
              {youth.playerStates.map((state, index) => (
                <div key={`${state.code}-${state.name}`} className="state-chip">
                  <EditableText
                    path={`youth.playerStates.${index}.code`}
                    value={state.code}
                    as="p"
                    className="font-display text-4xl tracking-wide text-[var(--blue)]"
                  />
                  <EditableText
                    path={`youth.playerStates.${index}.name`}
                    value={state.name}
                    as="p"
                    className="mt-1 text-sm font-semibold text-[var(--ink)]"
                  />
                  <EditableText
                    path={`youth.playerStates.${index}.note`}
                    value={state.note}
                    as="p"
                    multiline
                    className="mt-1 text-xs leading-snug text-[var(--muted)]"
                  />
                </div>
              ))}
            </div>

            <div className="youth-stats-row mt-8">
              {youth.playerStats.map((stat, index) => (
                <div key={stat.label} className="youth-stat">
                  <EditableText
                    path={`youth.playerStats.${index}.label`}
                    value={stat.label}
                    as="p"
                    className="text-[10px] font-bold tracking-[0.16em] text-[var(--blue)] uppercase"
                  />
                  <EditableText
                    path={`youth.playerStats.${index}.value`}
                    value={stat.value}
                    as="p"
                    className="mt-1 text-sm font-semibold text-[var(--ink)]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="section pt-10">
        <EditableText
          path="edits.leagues.scheduleKicker"
          value={resolveEditValue(
            content,
            "edits.leagues.scheduleKicker",
            "Fall schedule",
          )}
          as="p"
          className="section-kicker"
        />
        <EditableText
          path="edits.leagues.scheduleTitle"
          value={resolveEditValue(
            content,
            "edits.leagues.scheduleTitle",
            "Pick a league. Apply in minutes.",
          )}
          as="h2"
          className="font-display section-title mt-2 text-4xl tracking-[0.05em] text-[var(--ink)] sm:text-5xl"
        />
        <EditableText
          path="edits.leagues.scheduleCopy"
          value={resolveEditValue(
            content,
            "edits.leagues.scheduleCopy",
            `Sign in to submit a league application. Track Under review / Approved / Denied on your Profile. Questions? Call the league desk at ${SITE.leaguePhoneDisplay}.`,
          )}
          as="p"
          multiline
          className="mt-4 max-w-2xl text-sm text-[var(--muted)]"
        />

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

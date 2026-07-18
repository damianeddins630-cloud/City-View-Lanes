import type { Metadata } from "next";
import { Suspense } from "react";
import LeaguesClient from "@/components/LeaguesClient";
import { readStore } from "@/lib/db";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Fall Season Leagues",
  description: `${SITE.fallSeasonLabel} league menu and registration at CityView Lanes.`,
};

export const dynamic = "force-dynamic";

export default async function LeaguesPage() {
  const store = await readStore();

  return (
    <div className="league-menu-page">
      <section className="league-menu-hero">
        <div className="league-menu-hero-inner">
          <div className="league-star" aria-hidden />
          <p className="league-kicker">CityView Lanes · Fort Worth</p>
          <h1 className="font-display league-title">
            {SITE.fallSeasonLabel}
          </h1>
          <p className="league-subtitle">
            Official league menu — adult, senior, youth &amp; IGBO. Sign in to
            join a team or send your registration below.
          </p>
        </div>
      </section>

      <div className="league-menu-shell">
        <Suspense
          fallback={
            <p className="p-8 text-sm text-white/70">Loading league menu…</p>
          }
        >
          <LeaguesClient initialLeagues={store.leagues} />
        </Suspense>
      </div>
    </div>
  );
}

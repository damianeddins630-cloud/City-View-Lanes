import type { Metadata } from "next";
import LeaguesClient from "@/components/LeaguesClient";
import { readStore } from "@/lib/db";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leagues",
  description: "Fall 2026 league registration at CityView Lanes.",
};

export const dynamic = "force-dynamic";

export default async function LeaguesPage() {
  const store = await readStore();

  return (
    <div className="section pt-16">
      <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
        Leagues
      </p>
      <h1 className="font-display mt-2 max-w-3xl text-4xl tracking-[0.04em] text-[var(--navy)] sm:text-5xl">
        Summer leagues are wrapping up. Fall 2026 registration is officially
        open — adult, senior, youth, and IGBO leagues run weekly at CityView
        Lanes.
      </h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`tel:${SITE.phoneTel}`} className="btn btn-primary">
          Join a League
        </a>
        <a href={`tel:${SITE.phoneTel}`} className="btn btn-ghost">
          Call {SITE.phoneDisplay}
        </a>
      </div>

      <LeaguesClient initialLeagues={store.leagues} />

      <p className="mt-8 text-sm text-[var(--muted)]">
        Questions about Fall leagues? Call the center.
      </p>
    </div>
  );
}

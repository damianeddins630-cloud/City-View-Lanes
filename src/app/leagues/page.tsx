import type { Metadata } from "next";
import { Suspense } from "react";
import LeaguesClient from "@/components/LeaguesClient";
import { readStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "Leagues",
  description: "Fall 2026 league registration at CityView Lanes.",
};

export const dynamic = "force-dynamic";

export default async function LeaguesPage() {
  const store = await readStore();

  return (
    <div className="section pt-16">
      <div className="silver-bar mb-5 max-w-[140px]" />
      <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
        Leagues
      </p>
      <h1 className="font-display mt-2 max-w-3xl text-4xl tracking-[0.04em] text-[var(--navy)] sm:text-5xl">
        Fall 2026 registration is open — adult, senior, youth, and IGBO leagues
        run weekly at CityView Lanes.
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
        Sign in to join a league. Questions? Call the center.
      </p>

      <Suspense fallback={<p className="mt-8 text-sm text-[var(--muted)]">Loading leagues…</p>}>
        <LeaguesClient initialLeagues={store.leagues} />
      </Suspense>
    </div>
  );
}

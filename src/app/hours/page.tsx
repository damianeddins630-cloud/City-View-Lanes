import type { Metadata } from "next";
import { readStore } from "@/lib/db";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hours",
  description: "Fall hours of operation at CityView Lanes in Fort Worth.",
};

export const dynamic = "force-dynamic";

export default async function HoursPage() {
  const store = await readStore();

  return (
    <div className="section pt-16">
      <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
        CityView Lanes
      </p>
      <h1 className="font-display mt-2 text-5xl tracking-[0.05em] text-[var(--navy)] sm:text-6xl">
        Fall Hours of Operation
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
        We&apos;re open every day of the week. Walk-ins welcome — reservations
        recommended for parties of 8+.
      </p>

      <div className="mt-10 divide-y divide-[var(--line)] border border-[var(--line)] bg-white">
        {store.hours.map((row) => (
          <div
            key={row.day}
            className="grid gap-2 px-5 py-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-8"
          >
            <p className="font-display text-2xl tracking-[0.04em] text-[var(--navy)]">
              {row.day}
            </p>
            <p className="text-xs font-bold tracking-[0.14em] text-[var(--silver-deep)] uppercase">
              Hours
            </p>
            <p className="text-lg font-semibold text-[var(--ink)]">{row.open}</p>
            <p className="text-lg text-[var(--muted)]">
              <span className="mr-2 text-sm uppercase">to</span>
              {row.close}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-[var(--line)] bg-[var(--blue-soft)] p-6">
        <h2 className="font-display text-2xl text-[var(--navy)]">
          Holiday or special hours?
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Call ahead on major holidays to confirm hours and lane availability.
        </p>
        <a
          href={`tel:${SITE.phoneTel}`}
          className="btn btn-primary mt-5 inline-flex"
        >
          {SITE.phoneDisplay}
        </a>
      </div>
    </div>
  );
}

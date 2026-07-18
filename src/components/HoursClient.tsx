"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import type { DayHours } from "@/lib/types";

export default function HoursClient({
  initialHours,
}: {
  initialHours: DayHours[];
}) {
  const [hours, setHours] = useState(initialHours);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/hours?ts=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active && Array.isArray(d.hours)) setHours(d.hours);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="panel mt-10 divide-y divide-[var(--line)] overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-sm text-[var(--muted)]">Loading hours…</p>
        ) : (
          hours.map((row) => (
            <div
              key={row.day}
              className="interactive-row grid gap-2 px-5 py-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-8"
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
          ))
        )}
      </div>

      <div className="panel mt-10 bg-[var(--blue-soft)] p-6">
        <h2 className="font-display text-2xl text-[var(--navy)]">
          Holiday or special hours?
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Call ahead on major holidays to confirm hours and lane availability.
        </p>
        <a href={`tel:${SITE.phoneTel}`} className="btn btn-primary mt-5 inline-flex">
          {SITE.phoneDisplay}
        </a>
      </div>
    </>
  );
}

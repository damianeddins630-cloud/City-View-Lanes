import type { Metadata } from "next";
import HoursClient from "@/components/HoursClient";
import { readStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "Hours",
  description: "Fall hours of operation at CityView Lanes in Fort Worth.",
};

export const dynamic = "force-dynamic";

export default async function HoursPage() {
  const store = await readStore();

  return (
    <div className="section pt-16">
      <div className="silver-bar mb-5 max-w-[140px]" />
      <p className="text-sm font-bold tracking-[0.18em] text-[var(--blue)] uppercase">
        CityView Lanes
      </p>
      <h1 className="font-display mt-2 text-5xl tracking-[0.05em] text-white sm:text-6xl">
        Fall Hours of Operation
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
        We&apos;re open every day of the week. Walk-ins welcome — reservations
        recommended for parties of 8+.
      </p>
      <HoursClient initialHours={store.hours} />
    </div>
  );
}

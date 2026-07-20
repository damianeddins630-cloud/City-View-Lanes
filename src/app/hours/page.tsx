import type { Metadata } from "next";
import HoursClient from "@/components/HoursClient";
import PageBanner from "@/components/PageBanner";
import { readStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "Hours",
  description: "Fall hours of operation at CityView Lanes in Fort Worth.",
};

export const dynamic = "force-dynamic";

export default async function HoursPage() {
  const store = await readStore();

  return (
    <>
      <PageBanner
        kicker="CityView Lanes"
        title="Hours of operation"
        subtitle="Open every day. Walk-ins welcome — reservations recommended for parties of 8+."
      />
      <div className="section pt-10 pb-20">
        <HoursClient initialHours={store.hours} />
      </div>
    </>
  );
}

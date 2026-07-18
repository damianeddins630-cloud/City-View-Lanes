import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rates & Hours",
  description:
    "Daily bowling rates and hours of operation at Cityview Lanes in Fort Worth, TX.",
};

export default function RatesPage() {
  return (
    <div className="section pt-16">
      <p className="display fade-up text-sm text-wood">Rates</p>
      <h1 className="display fade-up mt-2 text-5xl text-cream sm:text-6xl">
        Daily rates
      </h1>
      <p className="fade-up-delay mt-4 max-w-2xl text-base leading-relaxed text-mist/80">
        Friday and Saturday after 5PM is prime time — lanes may only be
        purchased by the hour. Bowling shoes must be worn by all participants.
      </p>

      <div className="fade-up-delay-2 mt-10 grid gap-6 md:grid-cols-2">
        <div className="border border-[var(--line)] bg-[rgba(7,16,20,0.35)] p-6">
          <h2 className="display text-2xl text-cream">Open bowling</h2>
          <p className="mt-3 text-sm leading-relaxed text-mist/75">
            Call the front desk for today’s lane pricing, shoe rental, and
            specials. Rates can vary by daypart and availability.
          </p>
          <a href="tel:8173460444" className="btn btn-primary mt-6 text-xs">
            Call for today’s rates
          </a>
        </div>
        <div className="border border-[var(--line)] bg-[rgba(7,16,20,0.35)] p-6">
          <h2 className="display text-2xl text-cream">Hours of operation</h2>
          <ul className="mt-4 space-y-2 text-sm text-mist/85">
            <li className="flex justify-between gap-4 border-b border-[var(--line)] py-2">
              <span>Monday – Thursday</span>
              <span>12:00 PM – 11:00 PM</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-[var(--line)] py-2">
              <span>Friday – Saturday</span>
              <span>12:00 PM – 12:00 AM</span>
            </li>
            <li className="flex justify-between gap-4 py-2">
              <span>Sunday</span>
              <span>12:00 PM – 11:00 PM</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-mist/55">Times are subject to change.</p>
        </div>
      </div>

      <div className="mt-12 border-t border-[var(--line)] pt-8">
        <p className="text-sm text-mist/80">
          6601 Oakmont Blvd · Fort Worth, TX 76132
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/parties" className="btn btn-ghost text-xs">
            Plan a party
          </Link>
          <Link href="/leagues" className="btn btn-ghost text-xs">
            Join a league
          </Link>
        </div>
      </div>
    </div>
  );
}

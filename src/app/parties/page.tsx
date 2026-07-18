import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parties & Events",
  description:
    "Birthday parties, Neon Nights packages, and group events at Cityview Lanes in Fort Worth.",
};

export default function PartiesPage() {
  return (
    <div className="section pt-16">
      <p className="display fade-up text-sm text-wood">Parties</p>
      <h1 className="display fade-up mt-2 text-5xl text-cream sm:text-6xl">
        Celebrate on the lanes
      </h1>
      <p className="fade-up-delay mt-4 max-w-2xl text-base leading-relaxed text-mist/80">
        Birthday parties, office outings, church groups, and club nights —
        Cityview Lanes packages include bowling, shoe rentals, and food options
        so the weather never ruins the plan.
      </p>

      <div className="fade-up-delay-2 mt-10 grid gap-6 md:grid-cols-2">
        <div className="border border-[var(--line)] bg-[rgba(7,16,20,0.35)] p-6">
          <h2 className="display text-2xl text-cream">Group party packages</h2>
          <p className="mt-3 text-sm leading-relaxed text-mist/75">
            All packages include 2 hours of bowling and shoe rentals, based on a
            minimum of 20 people. Prefer to build your own? Ask about finger
            foods and custom group pricing.
          </p>
        </div>
        <div className="border border-[var(--line)] bg-[rgba(7,16,20,0.35)] p-6">
          <h2 className="display text-2xl text-cream">Neon Nights birthdays</h2>
          <p className="mt-3 text-sm leading-relaxed text-mist/75">
            Our Neon Nights birthday package is built for kids’ parties —
            automatic bumpers available, a party host on arrival, and food ready
            when bowling wraps. Book three to four weeks ahead when you can.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="display text-3xl text-cream">What to expect</h2>
        <ol className="mt-6 space-y-4 text-sm leading-relaxed text-mist/80">
          <li>
            <span className="font-semibold text-cream">1. Book ahead</span> —
            share the birthday child’s name, age, guest count, and preferred
            time.
          </li>
          <li>
            <span className="font-semibold text-cream">2. Arrive early</span> —
            show up about 15 minutes before start so we can set names and shoes.
          </li>
          <li>
            <span className="font-semibold text-cream">3. Bowl &amp; celebrate</span>{" "}
            — we help first-timers, then food and cake time after the frames.
          </li>
        </ol>
      </div>

      <div className="mt-12 border-t border-[var(--line)] pt-8">
        <p className="text-sm text-mist/80">
          Call (817) 346-0444 or email sales@cityviewlanesfortworth.com to book
          your party today.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="tel:8173460444" className="btn btn-primary text-xs">
            Call to book
          </a>
          <a
            href="mailto:sales@cityviewlanesfortworth.com"
            className="btn btn-ghost text-xs"
          >
            Email sales
          </a>
        </div>
      </div>
    </div>
  );
}

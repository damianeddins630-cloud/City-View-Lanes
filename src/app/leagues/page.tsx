import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leagues",
  description:
    "Traditional, no-tap, prize, and custom bowling leagues at Cityview Lanes in Fort Worth.",
};

export default function LeaguesPage() {
  return (
    <div className="section pt-16">
      <p className="display fade-up text-sm text-wood">Leagues</p>
      <h1 className="display fade-up mt-2 text-5xl text-cream sm:text-6xl">
        Put some fun in your week
      </h1>
      <p className="fade-up-delay mt-4 max-w-2xl text-base leading-relaxed text-mist/80">
        Cityview Lanes runs traditional leagues, 9-pin no-tap formats, cash-prize
        nights, and leagues with bowling ball or licensed merchandise awards.
        Handicap scoring keeps competition fair for every skill level.
      </p>

      <div className="fade-up-delay-2 mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="display text-3xl text-cream">How leagues work</h2>
          <p className="mt-4 text-sm leading-relaxed text-mist/75">
            Teams of men, women, or mixed bowlers meet on a set schedule —
            usually once a week — to compete for prize money, trophies, or
            simply the social night out. Less experienced bowlers can still win
            under the handicap system.
          </p>
        </div>
        <div>
          <h2 className="display text-3xl text-cream">Start your own</h2>
          <p className="mt-4 text-sm leading-relaxed text-mist/75">
            Form a league with friends, family, or coworkers. You pick the day,
            time, session count, and how often you want to bowl — weekly,
            bi-weekly, or monthly. We provide the lanes.
          </p>
        </div>
      </div>

      <div className="mt-12 border border-[var(--line)] bg-[rgba(7,16,20,0.35)] p-6 sm:p-8">
        <h2 className="display text-2xl text-cream">Ready to sign up?</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist/75">
          Call the desk or email sales to find an open league or lock in a
          custom schedule for your group.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="tel:8173460444" className="btn btn-primary text-xs">
            Call (817) 346-0444
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

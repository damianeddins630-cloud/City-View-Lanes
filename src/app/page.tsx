import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1546443046-ed1ce6ffd1ab?auto=format&fit=crop&w=2200&q=80"
          alt="Bowling lanes lit for an evening session"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,28,34,0.55)_0%,rgba(11,28,34,0.42)_40%,rgba(11,28,34,0.88)_100%)]" />
        <div className="lane-sweep pointer-events-none absolute inset-x-0 top-1/3 h-24 bg-[linear-gradient(90deg,transparent,rgba(255,106,61,0.22),transparent)] blur-2xl" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-[min(1120px,calc(100%-1.5rem))] flex-col justify-end pb-16 pt-28 sm:pb-20">
          <p className="display fade-up text-5xl leading-none text-cream sm:text-7xl md:text-8xl">
            Cityview Lanes
          </p>
          <h1 className="fade-up-delay mt-4 max-w-xl text-xl font-medium text-mist sm:text-2xl">
            Fort Worth bowling with lanes, leagues, and celebrations that fill
            the night.
          </h1>
          <p className="fade-up-delay-2 mt-4 max-w-lg text-base leading-relaxed text-mist/80">
            Open bowling, birthday parties, and weekly league play at 6601
            Oakmont Blvd.
          </p>
          <div className="fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <a href="tel:8173460444" className="btn btn-primary">
              Call (817) 346-0444
            </a>
            <Link href="/parties" className="btn btn-ghost">
              Book a party
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="display text-sm text-wood">The house</p>
        <h2 className="display mt-2 text-4xl text-cream sm:text-5xl">
          Sixty-four lanes. One Fort Worth hangout.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist/80">
          Cityview Lanes is a family fun center with open bowling, an arcade,
          cafe bites, and room to host your next group night — from kids’
          birthdays to office outings.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Open bowling",
              copy: "Show up, lace up, and roll. Shoes required for every bowler.",
              href: "/rates",
            },
            {
              title: "League nights",
              copy: "Traditional, no-tap, prize, and custom leagues for friends or coworkers.",
              href: "/leagues",
            },
            {
              title: "Parties & events",
              copy: "Neon Nights birthdays and group packages with bowling, shoes, and food.",
              href: "/parties",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group border-t border-[var(--line)] pt-5 transition-colors hover:border-signal"
            >
              <h3 className="display text-2xl text-cream group-hover:text-signal">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mist/75">
                {item.copy}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[rgba(7,16,20,0.45)]">
        <div className="section grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="display text-sm text-wood">Hours</p>
            <h2 className="display mt-2 text-4xl text-cream sm:text-5xl">
              When the pins are up
            </h2>
            <ul className="mt-6 space-y-2 text-sm text-mist/85">
              <li className="flex justify-between gap-6 border-b border-[var(--line)] py-2">
                <span>Monday – Thursday</span>
                <span>1PM – 10PM</span>
              </li>
              <li className="flex justify-between gap-6 border-b border-[var(--line)] py-2">
                <span>Friday</span>
                <span>1PM – 11PM</span>
              </li>
              <li className="flex justify-between gap-6 border-b border-[var(--line)] py-2">
                <span>Saturday</span>
                <span>12PM – 11PM</span>
              </li>
              <li className="flex justify-between gap-6 py-2">
                <span>Sunday</span>
                <span>1PM – 10PM</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-mist/55">Times are subject to change.</p>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-sm">
            <Image
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80"
              alt="Bowling ball ready on the approach"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hall of Fame Pro Shop",
  description:
    "Ballard's Bowling Academy — Del Ballard Jr. & Carolyn Dorin-Ballard at CityView Lanes.",
};

const services = [
  {
    title: "USBC Hall of Fame",
    copy: "Del Ballard Jr. & Carolyn Dorin-Ballard",
  },
  {
    title: "PBA / PWBA Hall of Fame",
    copy: "Two of the most decorated bowlers in history",
  },
  {
    title: "Custom Ball Drilling",
    copy: "Precision fitting in-house on the day of your visit",
  },
  {
    title: "Coaching",
    copy: "Group clinics and skill sessions for all levels",
  },
  {
    title: "Private Lessons",
    copy: "One-on-one coaching with Hall of Famers by appointment",
  },
  {
    title: "Elite Equipment",
    copy: "Balls, bags, shoes, and accessories from top brands",
  },
];

export default function ProShopPage() {
  return (
    <div className="hof-theme min-h-full">
      <section className="mx-auto w-[min(1140px,calc(100%-1.5rem))] pt-16 pb-10">
        <p className="text-sm font-bold tracking-[0.2em] text-[var(--hof-gold)] uppercase">
          Hall of Fame Pro Shop
        </p>
        <h1 className="font-display mt-3 text-5xl tracking-[0.06em] text-white sm:text-7xl">
          Ballard&apos;s
          <br />
          Bowling Academy
        </h1>
        <p className="mt-4 text-lg text-[var(--hof-gold)]">
          Owned by Del Ballard Jr. &amp; Carolyn Dorin-Ballard
        </p>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/75">
          A Hall of Fame pro shop located inside CityView Lanes. Two of the most
          decorated bowlers in the history of the sport — coaching, custom
          drilling, and elite equipment, all under one roof in Fort Worth.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={SITE.proShopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold"
          >
            Visit {SITE.proShopUrlLabel}
          </a>
          <a href={`tel:${SITE.phoneTel}`} className="btn btn-red">
            Call CityView {SITE.phoneDisplay}
          </a>
        </div>
        <p className="mt-4 text-sm text-white/65">
          Official site:{" "}
          <a
            href={SITE.proShopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--hof-gold)] underline underline-offset-4 hover:text-white"
          >
            {SITE.proShopUrlLabel}
          </a>
        </p>
      </section>

      <section className="mx-auto w-[min(1140px,calc(100%-1.5rem))] pb-10">
        <article className="border border-[rgba(201,162,39,0.45)] bg-black/50 p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--hof-gold)] uppercase">
            Pro Shop Manager · Cityview Lanes
          </p>
          <h2 className="font-display mt-2 text-4xl text-white sm:text-5xl">
            Tim Watson
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">
            Day-to-day manager of Ballard&apos;s Bowling Academy at CityView
            Lanes — your point of contact for pro shop visits, equipment, custom
            drilling appointments, and on-site questions at the Fort Worth
            location.
          </p>
          <div className="mt-5 max-w-xs border border-[rgba(201,162,39,0.3)] p-3 text-sm">
            <p className="text-xs tracking-[0.12em] text-[var(--hof-gold)] uppercase">
              Role
            </p>
            <p className="mt-1 font-semibold text-white">Pro Shop Manager</p>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Ballard&apos;s Bowling Academy · 6601 Oakmont Blvd, Fort Worth, TX
            76132
          </p>
          <a
            href={SITE.proShopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-[var(--hof-gold)] underline underline-offset-4"
          >
            Open Ballard&apos;s website →
          </a>
        </article>
      </section>

      <section className="mx-auto grid w-[min(1140px,calc(100%-1.5rem))] gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((item) => (
          <article
            key={item.title}
            className="border border-[rgba(201,162,39,0.35)] bg-black/40 p-5"
          >
            <h2 className="font-display text-2xl tracking-[0.04em] text-[var(--hof-gold)]">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-white/70">{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid w-[min(1140px,calc(100%-1.5rem))] gap-8 pb-12 lg:grid-cols-2">
        <article className="border border-[rgba(155,27,30,0.55)] bg-black/50 p-6">
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--hof-red)] uppercase">
            Legend
          </p>
          <h2 className="font-display mt-2 text-4xl text-white">Del Ballard Jr.</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            A two-time U.S. Open champion and one of the most respected
            competitors in the history of professional bowling.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-white/80">
            <li>13 PBA Titles</li>
            <li>1988 USBC Masters Champion</li>
            <li>1989 Firestone Tournament of Champions</li>
            <li>Two-Time U.S. Open Champion</li>
            <li>Top 50 Greatest Players in PBA History</li>
            <li>PBA Hall of Fame</li>
            <li>USBC Hall of Fame</li>
          </ul>
          <div className="hof-legend-photo relative mt-6 aspect-[4/3] overflow-hidden border border-[rgba(201,162,39,0.45)] bg-black/40">
            <Image
              src={SITE.delBallardPhoto}
              alt="Del Ballard Jr."
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </article>

        <article className="border border-[rgba(155,27,30,0.55)] bg-black/50 p-6">
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--hof-red)] uppercase">
            Legend
          </p>
          <h2 className="font-display mt-2 text-4xl text-white">
            Carolyn Dorin-Ballard
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            PWBA Player of the Year and one of the most dominant seasons in the
            history of women&apos;s professional bowling.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-white/80">
            <li>20 PWBA Titles</li>
            <li>2001 USBC Queens Champion</li>
            <li>2001 PWBA Player of the Year</li>
            <li>Seven Titles in One Season</li>
            <li>Three-Time Collegiate All-American</li>
            <li>PWBA Hall of Fame</li>
            <li>USBC Hall of Fame</li>
          </ul>
          <div className="hof-legend-photo relative mt-6 aspect-[4/3] overflow-hidden border border-[rgba(201,162,39,0.45)] bg-black/40">
            <Image
              src={SITE.carolynDorinBallardPhoto}
              alt="Carolyn Dorin-Ballard"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </article>
      </section>

      <section className="border-t border-[rgba(201,162,39,0.25)]">
        <div className="mx-auto flex w-[min(1140px,calc(100%-1.5rem))] flex-col gap-5 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-white">
              Ready to elevate your game?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Schedule a private lesson or custom ball drilling with Del or
              Carolyn — right inside CityView Lanes. Book online at{" "}
              <a
                href={SITE.proShopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--hof-gold)] underline underline-offset-4"
              >
                {SITE.proShopUrlLabel}
              </a>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={SITE.proShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              Go to their website
            </a>
            <a href={`tel:${SITE.phoneTel}`} className="btn btn-red">
              Call to schedule
            </a>
            <Link href="/book" className="btn btn-ghost text-white border-white/40">
              Book an event
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

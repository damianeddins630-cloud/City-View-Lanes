import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EditableText from "@/components/EditableText";
import { SITE } from "@/lib/site";
import { resolveEditValue } from "@/lib/contentPath";
import { readStore } from "@/lib/db";
import { ensureSiteContent } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "Hall of Fame Pro Shop",
  description:
    "Ballard's Bowling Academy — Del Ballard Jr. & Carolyn Dorin-Ballard at CityView Lanes.",
};

export const dynamic = "force-dynamic";

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

export default async function ProShopPage() {
  const store = await readStore();
  const content = ensureSiteContent(store.siteContent);

  return (
    <div className="hof-theme hof-gold-chrome min-h-full">
      <section className="mx-auto w-[min(1140px,calc(100%-1.5rem))] pt-16 pb-10">
        <EditableText
          path="edits.proshop.kicker"
          value={resolveEditValue(
            content,
            "edits.proshop.kicker",
            "Hall of Fame Pro Shop",
          )}
          as="p"
          className="text-sm font-bold tracking-[0.2em] text-[var(--hof-gold)] uppercase"
        />
        <EditableText
          path="edits.proshop.title"
          value={resolveEditValue(
            content,
            "edits.proshop.title",
            "Ballard's Bowling Academy",
          )}
          as="h1"
          className="font-display mt-3 text-5xl tracking-[0.06em] text-white sm:text-7xl"
        />
        <EditableText
          path="edits.proshop.owners"
          value={resolveEditValue(
            content,
            "edits.proshop.owners",
            "Owned by Del Ballard Jr. & Carolyn Dorin-Ballard",
          )}
          as="p"
          className="mt-4 text-lg text-[var(--hof-gold)]"
        />
        <EditableText
          path="edits.proshop.blurb"
          value={resolveEditValue(
            content,
            "edits.proshop.blurb",
            "A Hall of Fame pro shop located inside CityView Lanes. Two of the most decorated bowlers in the history of the sport — coaching, custom drilling, and elite equipment, all under one roof in Fort Worth.",
          )}
          as="p"
          multiline
          className="mt-5 max-w-3xl text-base leading-relaxed text-white/75"
        />
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
        <article className="panel p-6 sm:p-8">
          <EditableText
            path="edits.proshop.managerKicker"
            value={resolveEditValue(
              content,
              "edits.proshop.managerKicker",
              "Pro Shop Manager · Cityview Lanes",
            )}
            as="p"
            className="text-xs font-bold tracking-[0.18em] text-[var(--hof-gold)] uppercase"
          />
          <EditableText
            path="edits.proshop.managerName"
            value={resolveEditValue(content, "edits.proshop.managerName", "Tim Watson")}
            as="h2"
            className="font-display mt-2 text-4xl text-white sm:text-5xl"
          />
          <EditableText
            path="edits.proshop.managerCopy"
            value={resolveEditValue(
              content,
              "edits.proshop.managerCopy",
              "Day-to-day manager of Ballard's Bowling Academy at CityView Lanes — your point of contact for pro shop visits, equipment, custom drilling appointments, and on-site questions at the Fort Worth location.",
            )}
            as="p"
            multiline
            className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75"
          />
          <div className="mt-5 max-w-xs p-3 text-sm">
            <p className="text-xs tracking-[0.12em] text-[var(--hof-gold)] uppercase">
              Role
            </p>
            <EditableText
              path="edits.proshop.managerRole"
              value={resolveEditValue(
                content,
                "edits.proshop.managerRole",
                "Pro Shop Manager",
              )}
              as="p"
              className="mt-1 font-semibold text-white"
            />
          </div>
          <EditableText
            path="edits.proshop.managerAddress"
            value={resolveEditValue(
              content,
              "edits.proshop.managerAddress",
              "Ballard's Bowling Academy · 6601 Oakmont Blvd, Fort Worth, TX 76132",
            )}
            as="p"
            className="mt-4 text-sm text-white/60"
          />
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
        {services.map((item, index) => (
          <article key={item.title} className="panel p-5">
            <EditableText
              path={`edits.proshop.service${index}Title`}
              value={resolveEditValue(
                content,
                `edits.proshop.service${index}Title`,
                item.title,
              )}
              as="h2"
              className="font-display text-2xl tracking-[0.04em] text-[var(--hof-gold)]"
            />
            <EditableText
              path={`edits.proshop.service${index}Copy`}
              value={resolveEditValue(
                content,
                `edits.proshop.service${index}Copy`,
                item.copy,
              )}
              as="p"
              multiline
              className="mt-2 text-sm text-white/70"
            />
          </article>
        ))}
      </section>

      <section className="mx-auto grid w-[min(1140px,calc(100%-1.5rem))] gap-8 pb-12 lg:grid-cols-2">
        <article className="panel p-6">
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
          <div className="hof-legend-photo relative mt-6 aspect-[4/3] overflow-hidden bg-black/40">
            <Image
              src={SITE.delBallardPhoto}
              alt="Del Ballard Jr."
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </article>

        <article className="panel p-6">
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
          <div className="hof-legend-photo relative mt-6 aspect-[4/3] overflow-hidden bg-black/40">
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

      <section>
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
            <Link href="/book" className="btn btn-ghost text-white">
              Book an event
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

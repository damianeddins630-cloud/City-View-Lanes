import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[rgba(7,16,20,0.7)]">
      <div className="section grid gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-2xl text-cream">Cityview Lanes</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist/80">
            Fort Worth bowling, leagues, parties, and arcade fun at 6601 Oakmont
            Blvd.
          </p>
        </div>

        <div>
          <p className="display text-sm text-wood">Visit</p>
          <p className="mt-3 text-sm leading-relaxed text-mist/85">
            6601 Oakmont Blvd
            <br />
            Fort Worth, TX 76132
          </p>
          <a
            href="tel:8173460444"
            className="mt-3 inline-block text-sm font-semibold text-signal"
          >
            (817) 346-0444
          </a>
        </div>

        <div>
          <p className="display text-sm text-wood">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-mist/85">
            <Link href="/rates">Rates &amp; hours</Link>
            <Link href="/leagues">League bowling</Link>
            <Link href="/parties">Parties &amp; events</Link>
            <a href="mailto:sales@cityviewlanesfortworth.com">
              sales@cityviewlanesfortworth.com
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-4 text-center text-xs tracking-[0.12em] text-mist/55 uppercase">
        © {new Date().getFullYear()} Cityview Lanes · Fort Worth, TX
      </div>
    </footer>
  );
}

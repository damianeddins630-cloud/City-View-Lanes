type PageBannerProps = {
  kicker: string;
  title: string;
  subtitle?: string;
  /** @deprecated Photos only on Home / Pro Shop — ignored */
  image?: string;
  /** @deprecated ignored */
  imageAlt?: string;
};

/** Text-only page header. No background photos (those stay on Home + Pro Shop). */
export default function PageBanner({
  kicker,
  title,
  subtitle,
}: PageBannerProps) {
  return (
    <section className="page-banner page-banner-text relative isolate overflow-hidden">
      <div className="relative z-10 mx-auto w-[min(1160px,calc(100%-1.5rem))] py-14 sm:py-16">
        <p className="section-kicker text-[var(--ice-accent)]">{kicker}</p>
        <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[0.95] tracking-[0.04em] text-white uppercase">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

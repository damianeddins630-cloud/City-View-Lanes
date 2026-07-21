"use client";

import EditableText from "@/components/EditableText";

type PageBannerProps = {
  kicker: string;
  title: string;
  subtitle?: string;
  kickerPath?: string;
  titlePath?: string;
  subtitlePath?: string;
  /** @deprecated Photos only on Home / Pro Shop — ignored */
  image?: string;
  /** @deprecated ignored */
  imageAlt?: string;
};

/** Text-only page header. Click text in Edit mode to rename. */
export default function PageBanner({
  kicker,
  title,
  subtitle,
  kickerPath,
  titlePath,
  subtitlePath,
}: PageBannerProps) {
  return (
    <section className="page-banner page-banner-text relative isolate overflow-hidden">
      <div className="relative z-10 mx-auto w-[min(1160px,calc(100%-1.5rem))] py-14 sm:py-16">
        <EditableText
          path={kickerPath}
          value={kicker}
          as="p"
          className="section-kicker text-[var(--ice-accent)]"
        />
        <EditableText
          path={titlePath}
          value={title}
          as="h1"
          className="font-display mt-3 max-w-3xl text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[0.95] tracking-[0.04em] text-white uppercase"
        />
        {subtitle ? (
          <EditableText
            path={subtitlePath}
            value={subtitle}
            as="p"
            multiline
            className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg"
          />
        ) : null}
      </div>
    </section>
  );
}

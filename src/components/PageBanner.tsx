import Image from "next/image";

type PageBannerProps = {
  kicker: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
};

export default function PageBanner({
  kicker,
  title,
  subtitle,
  image = "/images/cityview-lanes.webp",
  imageAlt = "CityView Lanes Fort Worth",
}: PageBannerProps) {
  return (
    <section className="page-banner relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="page-banner-veil absolute inset-0" />
      <div className="hero-lane-glow pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative z-10 mx-auto w-[min(1160px,calc(100%-1.5rem))] py-16 sm:py-20">
        <div className="silver-bar mb-5 max-w-[140px]" />
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

import { REVIEWS, WHY_CARDS, YOUTH_LEAGUE } from "./site";
import type { SiteContent } from "./types";

export function defaultSiteContent(): SiteContent {
  return {
    home: {
      heroImage: "/images/yelp-lanes-extra.jpg",
      heroImageAlt: "Bowling lanes at CityView Lanes Fort Worth",
      heroTitleLine1: "CityView",
      heroTitleLine2: "Lanes",
      heroSubtitle:
        "Fort Worth bowling, leagues, and Hall of Fame coaching — under one roof.",
      marquee: [
        "League Bowling",
        "Birthday Parties",
        "Corporate Events",
        "Hall of Fame Coaching",
        "Open Bowling Daily",
        "Ballard's Pro Shop",
      ],
      whyKicker: "Why CityView Lanes",
      whyTitle: "Built for every kind of bowler.",
      whyCopy:
        "League nights, birthday parties, corporate events, and open bowling — with a Hall of Fame pro shop right on site.",
      whyCards: WHY_CARDS.map((c) => ({ title: c.title, copy: c.copy })),
      academyKicker: "Hall of Fame Coaching",
      academyTitle: "Ballard's Bowling Academy",
      academyCopy:
        "Owned by Del Ballard Jr. and Carolyn Dorin-Ballard — 33 combined PBA & PWBA titles, four Hall of Fame inductions, and one pro shop inside CityView Lanes.",
      academyImage: "/images/cityview-lanes.webp",
      academyImageAlt: "CityView Lanes lanes 59 and 60",
      academyStat1Value: "33",
      academyStat1Label: "Combined PBA + PWBA titles",
      academyStat2Value: "4",
      academyStat2Label: "Hall of Fame inductions",
      galleryKicker: "Inside the Center",
      galleryTitle: "The lanes in real life",
      galleryCopy:
        "Real photos from CityView Lanes — more official gallery shots coming soon.",
      galleryImages: [
        {
          src: "/images/yelp-interior-fresh.jpg",
          alt: "Youth bowler on the lanes at CityView Lanes",
        },
        {
          src: "/images/cityview-lanes.webp",
          alt: "CityView Lanes branded pin deck",
        },
        {
          src: "/images/yelp-lanes-dragon.jpg",
          alt: "Kids bowling with ramp at CityView Lanes",
        },
      ],
      reviewsKicker: "Loved locally",
      reviewsTitle: "What bowlers say",
      reviews: REVIEWS.map((r) => ({
        quote: r.quote,
        name: r.name,
        role: r.role,
      })),
      visitKicker: "Come visit",
      visitImage: "/images/yelp-lanes-extra.jpg",
      visitHoursNote: "Open daily 12:00 PM – 12:00 AM",
      visitParkingNote: "Free parking on-site",
      lanesAvailable: true,
      lanesStatusLabel: "Lane availability",
      lanesAvailableText: "Lanes available now",
      lanesUnavailableText: "No lanes available right now",
      pricingLabel: "Pricing",
      pricingValue: "N/A",
    },
    youth: {
      kicker: YOUTH_LEAGUE.kicker,
      title: YOUTH_LEAGUE.title,
      blurb: YOUTH_LEAGUE.blurb,
      ages: YOUTH_LEAGUE.ages,
      season: YOUTH_LEAGUE.season,
      format: YOUTH_LEAGUE.format,
      phoneNote: YOUTH_LEAGUE.phoneNote,
      heroImage: "/images/yelp-lanes-dragon.jpg",
      photos: [
        {
          src: "/images/yelp-lanes-wide.jpg",
          alt: "Kids having fun at CityView Lanes",
        },
        {
          src: "/images/yelp-lanes-dragon.jpg",
          alt: "Youth bowling with ramp at CityView Lanes",
        },
        {
          src: "/images/yelp-interior-fresh.jpg",
          alt: "Youth bowler releasing a ball at CityView Lanes",
        },
      ],
      highlights: YOUTH_LEAGUE.highlights.map((h) => ({
        label: h.label,
        value: h.value,
      })),
      playerStates: YOUTH_LEAGUE.playerStates.map((s) => ({
        code: s.code,
        name: s.name,
        note: s.note,
      })),
      playerStats: YOUTH_LEAGUE.playerStats.map((s) => ({
        label: s.label,
        value: s.value,
      })),
    },
  };
}

function mergeString(current: unknown, fallback: string): string {
  return typeof current === "string" && current.trim() ? current : fallback;
}

/** Swap older bundled defaults for the newer lane photo pack. */
function refreshBundledPhoto(current: unknown, next: string, previous: string[]): string {
  if (typeof current !== "string" || !current.trim()) return next;
  if (previous.includes(current)) return next;
  return current;
}

/** Fill missing site content from defaults so old stores keep working. */
export function ensureSiteContent(content: SiteContent | undefined | null): SiteContent {
  const defaults = defaultSiteContent();
  if (!content || typeof content !== "object") return defaults;

  const homeIn = content.home || ({} as SiteContent["home"]);
  const youthIn = content.youth || ({} as SiteContent["youth"]);
  const d = defaults;

  return {
    home: {
      heroImage: refreshBundledPhoto(homeIn.heroImage, d.home.heroImage, [
        "/images/cityview-lanes.webp",
        "/images/cityview-interior.webp",
      ]),
      heroImageAlt: mergeString(homeIn.heroImageAlt, d.home.heroImageAlt),
      heroTitleLine1: mergeString(homeIn.heroTitleLine1, d.home.heroTitleLine1),
      heroTitleLine2: mergeString(homeIn.heroTitleLine2, d.home.heroTitleLine2),
      heroSubtitle: mergeString(homeIn.heroSubtitle, d.home.heroSubtitle),
      marquee:
        Array.isArray(homeIn.marquee) && homeIn.marquee.length
          ? homeIn.marquee.map(String)
          : d.home.marquee,
      whyKicker: mergeString(homeIn.whyKicker, d.home.whyKicker),
      whyTitle: mergeString(homeIn.whyTitle, d.home.whyTitle),
      whyCopy: mergeString(homeIn.whyCopy, d.home.whyCopy),
      whyCards:
        Array.isArray(homeIn.whyCards) && homeIn.whyCards.length
          ? homeIn.whyCards.map((c, i) => ({
              title: mergeString(c?.title, d.home.whyCards[i]?.title || "Title"),
              copy: mergeString(c?.copy, d.home.whyCards[i]?.copy || ""),
            }))
          : d.home.whyCards,
      academyKicker: mergeString(homeIn.academyKicker, d.home.academyKicker),
      academyTitle: mergeString(homeIn.academyTitle, d.home.academyTitle),
      academyCopy: mergeString(homeIn.academyCopy, d.home.academyCopy),
      academyImage: mergeString(homeIn.academyImage, d.home.academyImage),
      academyImageAlt: mergeString(homeIn.academyImageAlt, d.home.academyImageAlt),
      academyStat1Value: mergeString(
        homeIn.academyStat1Value,
        d.home.academyStat1Value,
      ),
      academyStat1Label: mergeString(
        homeIn.academyStat1Label,
        d.home.academyStat1Label,
      ),
      academyStat2Value: mergeString(
        homeIn.academyStat2Value,
        d.home.academyStat2Value,
      ),
      academyStat2Label: mergeString(
        homeIn.academyStat2Label,
        d.home.academyStat2Label,
      ),
      galleryKicker: mergeString(homeIn.galleryKicker, d.home.galleryKicker),
      galleryTitle: mergeString(homeIn.galleryTitle, d.home.galleryTitle),
      galleryCopy: mergeString(homeIn.galleryCopy, d.home.galleryCopy),
      galleryImages:
        Array.isArray(homeIn.galleryImages) && homeIn.galleryImages.length
          ? [0, 1, 2].map((i) => ({
              src: mergeString(
                homeIn.galleryImages[i]?.src,
                d.home.galleryImages[i]?.src || d.home.heroImage,
              ),
              alt: mergeString(
                homeIn.galleryImages[i]?.alt,
                d.home.galleryImages[i]?.alt || "CityView Lanes",
              ),
            }))
          : d.home.galleryImages,
      reviewsKicker: mergeString(homeIn.reviewsKicker, d.home.reviewsKicker),
      reviewsTitle: mergeString(homeIn.reviewsTitle, d.home.reviewsTitle),
      reviews:
        Array.isArray(homeIn.reviews) && homeIn.reviews.length
          ? homeIn.reviews.map((r, i) => ({
              quote: mergeString(r?.quote, d.home.reviews[i]?.quote || ""),
              name: mergeString(r?.name, d.home.reviews[i]?.name || "Guest"),
              role: mergeString(r?.role, d.home.reviews[i]?.role || ""),
            }))
          : d.home.reviews,
      visitKicker: mergeString(homeIn.visitKicker, d.home.visitKicker),
      visitImage: mergeString(homeIn.visitImage, d.home.visitImage),
      visitHoursNote: mergeString(homeIn.visitHoursNote, d.home.visitHoursNote),
      visitParkingNote: mergeString(
        homeIn.visitParkingNote,
        d.home.visitParkingNote,
      ),
      lanesAvailable:
        typeof homeIn.lanesAvailable === "boolean"
          ? homeIn.lanesAvailable
          : d.home.lanesAvailable,
      lanesStatusLabel: mergeString(
        homeIn.lanesStatusLabel,
        d.home.lanesStatusLabel,
      ),
      lanesAvailableText: mergeString(
        homeIn.lanesAvailableText,
        d.home.lanesAvailableText,
      ),
      lanesUnavailableText: mergeString(
        homeIn.lanesUnavailableText,
        d.home.lanesUnavailableText,
      ),
      pricingLabel: mergeString(homeIn.pricingLabel, d.home.pricingLabel),
      pricingValue: mergeString(homeIn.pricingValue, d.home.pricingValue),
    },
    youth: {
      kicker: mergeString(youthIn.kicker, d.youth.kicker),
      title: mergeString(youthIn.title, d.youth.title),
      blurb: mergeString(youthIn.blurb, d.youth.blurb),
      ages: mergeString(youthIn.ages, d.youth.ages),
      season: mergeString(youthIn.season, d.youth.season),
      format: mergeString(youthIn.format, d.youth.format),
      phoneNote: mergeString(youthIn.phoneNote, d.youth.phoneNote),
      heroImage: mergeString(youthIn.heroImage, d.youth.heroImage),
      photos:
        Array.isArray(youthIn.photos) && youthIn.photos.length
          ? [0, 1, 2].map((i) => ({
              src: mergeString(
                youthIn.photos[i]?.src,
                d.youth.photos[i]?.src || d.youth.heroImage,
              ),
              alt: mergeString(
                youthIn.photos[i]?.alt,
                d.youth.photos[i]?.alt || "Youth bowling",
              ),
            }))
          : d.youth.photos,
      highlights:
        Array.isArray(youthIn.highlights) && youthIn.highlights.length
          ? youthIn.highlights.map((h, i) => ({
              label: mergeString(h?.label, d.youth.highlights[i]?.label || ""),
              value: mergeString(h?.value, d.youth.highlights[i]?.value || ""),
            }))
          : d.youth.highlights,
      playerStates:
        Array.isArray(youthIn.playerStates) && youthIn.playerStates.length
          ? youthIn.playerStates.map((s, i) => ({
              code: mergeString(s?.code, d.youth.playerStates[i]?.code || "TX"),
              name: mergeString(s?.name, d.youth.playerStates[i]?.name || ""),
              note: mergeString(s?.note, d.youth.playerStates[i]?.note || ""),
            }))
          : d.youth.playerStates,
      playerStats:
        Array.isArray(youthIn.playerStats) && youthIn.playerStats.length
          ? youthIn.playerStats.map((s, i) => ({
              label: mergeString(s?.label, d.youth.playerStats[i]?.label || ""),
              value: mergeString(s?.value, d.youth.playerStats[i]?.value || ""),
            }))
          : d.youth.playerStats,
    },
  };
}

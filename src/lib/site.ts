export const SITE = {
  name: "CityView Lanes",
  tagline:
    "Fort Worth's home for league bowling, birthday parties, corporate events, and Hall of Fame coaching at Ballard's Bowling Academy.",
  addressLine1: "6601 Oakmont Blvd",
  addressLine2: "Fort Worth, TX 76132",
  phoneDisplay: "(817) 346-0333",
  phoneTel: "8173460333",
  /** League desk line from the Fall Season printed menu */
  leaguePhoneDisplay: "(817) 346-0444",
  leaguePhoneTel: "8173460444",
  email: "sales@cityviewlanesfortworth.com",
  fallSeasonLabel: "Fall Season 2026-2027",
};

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/hours", label: "Hours" },
  { href: "/leagues", label: "Leagues" },
  { href: "/pro-shop", label: "Pro Shop" },
  { href: "/book", label: "Book a Party" },
  { href: "/careers", label: "Careers" },
];

export const REVIEWS = [
  {
    quote:
      "The best-kept secret in Fort Worth. Fast lanes, great staff, and my Thursday league has never been better.",
    name: "Marcus J.",
    role: "League Bowler",
  },
  {
    quote:
      "We booked my daughter's 8th birthday here — the party host handled everything and the kids had a blast.",
    name: "Priya S.",
    role: "Party Host",
  },
  {
    quote:
      "Del and Carolyn's pro shop is a game-changer. My students improved faster after one lesson than a full season.",
    name: "Coach D.",
    role: "Youth Coach",
  },
];

/** Youth program copy for the Leagues page — edit anytime. */
export const YOUTH_LEAGUE = {
  kicker: "Youth League",
  title: "CityView Youth Bowling",
  blurb:
    "Kids and teens learn the game, build team spirit, and compete with coaches who care — right here on Oakmont Blvd in Fort Worth.",
  ages: "Ages 5–17",
  season: "Fall Season 2026-2027",
  format: "Weekly league play · USBC youth format · Fun + fundamentals",
  phoneNote: "Ask for the youth / league desk",
  photos: [
    {
      src: "/images/yelp-lanes-kids.jpg",
      alt: "Kids bowling at CityView Lanes",
    },
    {
      src: "/images/cityview-lanes.webp",
      alt: "CityView Lanes bowling lanes",
    },
    {
      src: "/images/yelp-interior-1.jpg",
      alt: "Inside CityView Lanes",
    },
  ],
  highlights: [
    { label: "Age range", value: "5–17" },
    { label: "Season", value: "Fall 2026" },
    { label: "Home center", value: "Fort Worth, TX" },
    { label: "Coaching", value: "On-site academy" },
  ],
  /** States CityView youth players come from / compete representing */
  playerStates: [
    { code: "TX", name: "Texas", note: "Home state — most of our youth roster" },
    { code: "OK", name: "Oklahoma", note: "Travel & tournament partners" },
    { code: "LA", name: "Louisiana", note: "Regional competition" },
    { code: "AR", name: "Arkansas", note: "Regional competition" },
    { code: "NM", name: "New Mexico", note: "Travel events" },
    { code: "KS", name: "Kansas", note: "Travel events" },
  ],
  /** Quick program stats shown next to the states board */
  playerStats: [
    { label: "Youth bowlers", value: "Growing roster" },
    { label: "Divisions", value: "Bantam · Prep · Junior · Major" },
    { label: "Focus", value: "Fun, form, and fair play" },
    { label: "Next step", value: "Apply on this page" },
  ],
};

export const WHY_CARDS = [
  {
    title: "League Bowling",
    copy: "15+ adult, senior, youth, and IGBO leagues running weekly.",
  },
  {
    title: "Birthday Parties",
    copy: "Turnkey parties with lanes, food, and a party host.",
  },
  {
    title: "Corporate Events",
    copy: "Team-building nights and private lane packages.",
  },
  {
    title: "Family Fun",
    copy: "Open bowling every day of the week for all ages.",
  },
  {
    title: "Hall of Fame Coaching",
    copy: "Private lessons with USBC & PBA Hall of Famers.",
  },
  {
    title: "Ballard's Academy",
    copy: "Custom ball drilling & elite equipment on-site.",
  },
];

export const ALL_PERMISSIONS = [
  { id: "view_admin", label: "Access admin panel" },
  { id: "manage_users", label: "Manage users & roles assignment" },
  { id: "manage_roles", label: "Create and edit roles" },
  { id: "admin_chat", label: "Admin chat" },
  { id: "manage_bookings", label: "Approve / deny party applications" },
  { id: "manage_league_signups", label: "Approve / deny league applications" },
  { id: "manage_leagues", label: "Add / edit / remove leagues" },
  { id: "manage_hours", label: "Edit open hours" },
  { id: "view_admins", label: "View admin list" },
  { id: "manage_employment", label: "Approve / deny employment applications" },
] as const;

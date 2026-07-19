export type Permission =
  | "view_admin"
  | "manage_users"
  | "manage_roles"
  | "admin_chat"
  | "manage_bookings"
  | "manage_league_signups"
  | "manage_leagues"
  | "manage_hours"
  | "view_admins"
  | "manage_employment"
  | "manage_content"
  /** Legacy — stripped from roles; not assignable. */
  | "edit_site";

export type SiteImageSlot = {
  src: string;
  alt: string;
};

export type SiteContent = {
  /** Freeform page text overrides (double-click edit paths under edits.*). */
  edits?: Record<string, string>;
  home: {
    heroImage: string;
    heroImageAlt: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroSubtitle: string;
    marquee: string[];
    whyKicker: string;
    whyTitle: string;
    whyCopy: string;
    whyCards: Array<{ title: string; copy: string }>;
    academyKicker: string;
    academyTitle: string;
    academyCopy: string;
    academyImage: string;
    academyImageAlt: string;
    academyStat1Value: string;
    academyStat1Label: string;
    academyStat2Value: string;
    academyStat2Label: string;
    galleryKicker: string;
    galleryTitle: string;
    galleryCopy: string;
    galleryImages: SiteImageSlot[];
    reviewsKicker: string;
    reviewsTitle: string;
    reviews: Array<{ quote: string; name: string; role: string }>;
    visitKicker: string;
    visitImage: string;
    visitHoursNote: string;
    visitParkingNote: string;
    /** Show on homepage whether open bowling lanes are free. */
    lanesAvailable: boolean;
    lanesStatusLabel: string;
    lanesAvailableText: string;
    lanesUnavailableText: string;
    /** Pricing line on homepage — use "N/A" until set. */
    pricingLabel: string;
    pricingValue: string;
  };
  youth: {
    kicker: string;
    title: string;
    blurb: string;
    ages: string;
    season: string;
    format: string;
    phoneNote: string;
    heroImage: string;
    photos: SiteImageSlot[];
    highlights: Array<{ label: string; value: string }>;
    playerStates: Array<{ code: string; name: string; note: string }>;
    playerStats: Array<{ label: string; value: string }>;
  };
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  /** Lower number = higher authority. Website Owner = 0. */
  rank: number;
  locked?: boolean;
};

export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  avatarUrl: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "passwordHash"> & {
  roleName: string;
  roleRank: number;
  permissions: Permission[];
};

export type League = {
  id: string;
  day: string;
  time: string;
  name: string;
  type: string;
  teamSize: string;
  startDate: string;
  meetingInfo: string;
  createdAt: string;
};

export type ApplicationStatus = "pending" | "approved" | "denied";

export type LeagueSignup = {
  id: string;
  userId: string;
  leagueId: string;
  status: ApplicationStatus;
  note: string;
  /** Team / league application name */
  teamName: string;
  firstName: string;
  lastName: string;
  applicantName: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  fullTeam: string;
  teamCount: string;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
};

export type Booking = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  partySize: number;
  eventType: string;
  notes: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
};

export type EducationEntry = {
  nameLocation: string;
  graduateDegree: string;
  majorSubjects: string;
};

export type WorkExperienceEntry = {
  dateEmployed: string;
  companyName: string;
  location: string;
  roleTitle: string;
  notes: string;
};

export type EmploymentApplication = {
  id: string;
  userId: string;
  applicationDate: string;
  firstName: string;
  lastName: string;
  middleName: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  altStreet: string;
  altApt: string;
  altCity: string;
  altState: string;
  altZip: string;
  homePhone: string;
  mobilePhone: string;
  email: string;
  howHeard: string;
  position: string;
  availableStartDate: string;
  desiredPay: string;
  currentlyEmployed: string;
  education: {
    highSchool: EducationEntry;
    college: EducationEntry;
    specialized: EducationEntry;
    other: EducationEntry;
  };
  specialSkills: string;
  experience: WorkExperienceEntry[];
  status: ApplicationStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type DayHours = {
  day: string;
  open: string;
  close: string;
};

export type ChatMessage = {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
  kind: string;
  read?: boolean;
};

export type Store = {
  users: User[];
  roles: Role[];
  leagues: League[];
  leagueSignups: LeagueSignup[];
  bookings: Booking[];
  employmentApplications: EmploymentApplication[];
  hours: DayHours[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
  siteContent: SiteContent;
};

export type SessionPayload = {
  userId: string;
  username: string;
  roleId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  avatarUrl?: string;
};

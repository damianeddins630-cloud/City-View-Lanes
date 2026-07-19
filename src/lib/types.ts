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
  | "manage_employment";

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

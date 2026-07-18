export type Permission =
  | "view_admin"
  | "manage_users"
  | "manage_roles"
  | "admin_chat"
  | "manage_bookings"
  | "manage_league_signups"
  | "manage_leagues"
  | "manage_hours"
  | "view_admins";

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
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

export type LeagueSignup = {
  id: string;
  userId: string;
  leagueId: string;
  status: "pending" | "approved" | "denied";
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
  status: "pending" | "approved" | "denied";
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
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
};

export type Store = {
  users: User[];
  roles: Role[];
  leagues: League[];
  leagueSignups: LeagueSignup[];
  bookings: Booking[];
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

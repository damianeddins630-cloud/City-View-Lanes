import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { readStore } from "./db";
import {
  canAccessAdminPanel,
  sanitizeAssignablePermissions,
} from "./permissions";
import type { Permission, PublicUser, SessionPayload, User } from "./types";

export { canAccessAdminPanel, sanitizeAssignablePermissions };

const COOKIE = "cvl_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET || "cityview-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function sessionFromUser(user: User): SessionPayload {
  // Keep cookie small — never put large base64 avatars into the JWT.
  const avatarUrl =
    user.avatarUrl && user.avatarUrl.length < 300 ? user.avatarUrl : "";
  return {
    userId: user.id,
    username: user.username,
    roleId: user.roleId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    birthDate: user.birthDate,
    avatarUrl,
  };
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretKey());
}

export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function refreshSessionForUser(user: User) {
  const token = await createSessionToken(sessionFromUser(user));
  await setSessionCookie(token);
}

export function toPublicUser(
  user: User,
  roleName: string,
  permissions: Permission[],
  roleRank = 999,
): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return { ...rest, roleName, roleRank, permissions };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await readSession();
  if (!session) return null;

  const store = await readStore();
  const user = store.users.find((u) => u.id === session.userId);
  if (!user) return null;

  // Always use the store roleId so admin role changes take effect immediately.
  // Session overlay only keeps profile text fields visible if durable DB lags.
  const merged: User = {
    ...user,
    username: session.username || user.username,
    firstName: session.firstName ?? user.firstName,
    lastName: session.lastName ?? user.lastName,
    email: session.email ?? user.email,
    phone: session.phone ?? user.phone,
    birthDate: session.birthDate ?? user.birthDate,
    avatarUrl: user.avatarUrl || session.avatarUrl || "",
    roleId: user.roleId,
  };

  const role = store.roles.find((r) => r.id === merged.roleId);
  return toPublicUser(
    merged,
    role?.name || "Member",
    role?.permissions || [],
    typeof role?.rank === "number" ? role.rank : 999,
  );
}

export function hasPermission(user: PublicUser | null, permission: Permission) {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function requirePermission(user: PublicUser | null, permission: Permission) {
  if (!hasPermission(user, permission)) {
    throw new Error("Forbidden");
  }
}

export { COOKIE };

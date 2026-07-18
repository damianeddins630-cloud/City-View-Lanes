import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { readStore } from "./db";
import type { Permission, PublicUser, SessionPayload, User } from "./types";

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

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
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

export function toPublicUser(user: User, roleName: string, permissions: Permission[]): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return { ...rest, roleName, permissions };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await readSession();
  if (!session) return null;
  const store = await readStore();
  const user = store.users.find((u) => u.id === session.userId);
  if (!user) return null;
  const role = store.roles.find((r) => r.id === user.roleId);
  return toPublicUser(user, role?.name || "Member", role?.permissions || []);
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

import { NextResponse } from "next/server";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  toPublicUser,
} from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { makeId } from "@/lib/ids";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const phone = String(body.phone || "").trim();

    if (!username || !email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Username, email, and a password (6+ chars) are required." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    const store = await updateStore((s) => {
      if (s.users.some((u) => u.username === username || u.email === email)) {
        throw new Error("Username or email already in use.");
      }

      const memberRole =
        s.roles.find((r) => r.name === "Member") ||
        s.roles.find((r) => r.id === "role_member");

      const now = new Date().toISOString();
      s.users.push({
        id: makeId("usr"),
        username,
        email,
        passwordHash,
        firstName: firstName || username,
        lastName,
        phone,
        birthDate: "",
        avatarUrl: "",
        roleId: memberRole?.id || "role_member",
        createdAt: now,
        updatedAt: now,
      });
    });

    const user = store.users.find((u) => u.username === username)!;
    const role = store.roles.find((r) => r.id === user.roleId);
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: toPublicUser(user, role?.name || "Member", role?.permissions || []),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

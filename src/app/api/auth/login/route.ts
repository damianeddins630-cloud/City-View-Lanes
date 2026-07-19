import { NextResponse } from "next/server";
import {
  refreshSessionForUser,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { readStore } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required." },
        { status: 400 },
      );
    }

    const store = await readStore();
    const user = store.users.find(
      (u) => u.username === identifier || u.email === identifier,
    );

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid username/email or password." },
        { status: 401 },
      );
    }

    const role = store.roles.find((r) => r.id === user.roleId);
    await refreshSessionForUser(user);

    return NextResponse.json({
      user: toPublicUser(
        user,
        role?.name || "Member",
        role?.permissions || [],
        typeof role?.rank === "number" ? role.rank : 999,
      ),
    });
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

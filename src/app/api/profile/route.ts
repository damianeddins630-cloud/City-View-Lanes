import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hashPassword,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { persistenceMode, updateStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const store = await updateStore(async (s) => {
      const user = s.users.find((u) => u.id === current.id);
      if (!user) throw new Error("User not found");

      if (body.firstName !== undefined) user.firstName = String(body.firstName).trim();
      if (body.lastName !== undefined) user.lastName = String(body.lastName).trim();
      if (body.phone !== undefined) user.phone = String(body.phone).trim();
      if (body.birthDate !== undefined) user.birthDate = String(body.birthDate).trim();
      if (body.avatarUrl !== undefined) user.avatarUrl = String(body.avatarUrl);

      if (body.email !== undefined) {
        const email = String(body.email).trim().toLowerCase();
        if (
          s.users.some((u) => u.id !== user.id && u.email === email)
        ) {
          throw new Error("Email already in use.");
        }
        user.email = email;
      }

      if (body.username !== undefined) {
        const username = String(body.username).trim().toLowerCase();
        if (
          s.users.some((u) => u.id !== user.id && u.username === username)
        ) {
          throw new Error("Username already in use.");
        }
        user.username = username;
      }

      if (body.newPassword) {
        const currentPassword = String(body.currentPassword || "");
        if (!(await verifyPassword(currentPassword, user.passwordHash))) {
          throw new Error("Current password is incorrect.");
        }
        if (String(body.newPassword).length < 6) {
          throw new Error("New password must be at least 6 characters.");
        }
        user.passwordHash = await hashPassword(String(body.newPassword));
      }

      user.updatedAt = new Date().toISOString();
    });

    const user = store.users.find((u) => u.id === current.id)!;
    const role = store.roles.find((r) => r.id === user.roleId);
    revalidatePath("/profile");
    return NextResponse.json({
      user: toPublicUser(user, role?.name || "Member", role?.permissions || []),
      persistence: persistenceMode(),
      ok: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

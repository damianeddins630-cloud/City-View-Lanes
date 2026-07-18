import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_users") && !hasPermission(user, "view_admins")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const store = await readStore();
  const users = store.users.map((u) => {
    const role = store.roles.find((r) => r.id === u.roleId);
    const bookings = store.bookings
      .filter((b) => b.userId === u.id)
      .map((b) => ({
        id: b.id,
        status: b.status,
        eventType: b.eventType,
        eventDate: b.eventDate,
        eventTime: b.eventTime,
        partySize: b.partySize,
        phone: b.phone,
        email: b.email,
        notes: b.notes,
        createdAt: b.createdAt,
        adminNote: b.adminNote || "",
      }));
    const leagueSignups = store.leagueSignups
      .filter((s) => s.userId === u.id)
      .map((s) => {
        const league = store.leagues.find((l) => l.id === s.leagueId);
        return {
          id: s.id,
          status: s.status,
          leagueId: s.leagueId,
          leagueName: league?.name || "Unknown league",
          leagueDay: league?.day || "",
          leagueTime: league?.time || "",
          note: s.note,
          createdAt: s.createdAt,
          adminNote: s.adminNote || "",
        };
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = u;
    return {
      ...rest,
      roleName: role?.name || "Member",
      permissions: role?.permissions || [],
      bookingCount: bookings.length,
      leagueSignupCount: leagueSignups.length,
      bookings,
      leagueSignups,
    };
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_users")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = String(body.userId || "");
    const roleId = String(body.roleId || "");

    const { store } = await updateStore((s) => {
      const target = s.users.find((u) => u.id === userId);
      if (!target) throw new Error("User not found");
      const role = s.roles.find((r) => r.id === roleId);
      if (!role) throw new Error("Role not found");

      if (target.roleId === "role_master_admin" && roleId !== "role_master_admin") {
        const masters = s.users.filter((u) => u.roleId === "role_master_admin");
        if (masters.length <= 1) {
          throw new Error("Cannot remove the only Master Admin.");
        }
      }

      target.roleId = roleId;
      target.updatedAt = new Date().toISOString();
    });

    return NextResponse.json({ ok: true, usersCount: store.users.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

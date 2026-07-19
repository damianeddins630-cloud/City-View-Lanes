import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import {
  WEBSITE_OWNER_ROLE_ID,
  roleRank,
} from "@/lib/roles";

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
          leagueName:
            s.leagueId === "waitlist"
              ? "League interest / waitlist"
              : league?.name || "Unknown league",
          leagueDay: league?.day || "",
          leagueTime: league?.time || "",
          note: s.note,
          createdAt: s.createdAt,
          adminNote: s.adminNote || "",
        };
      });
    const employmentApps = (store.employmentApplications || [])
      .filter((a) => a.userId === u.id)
      .map((a) => ({
        id: a.id,
        status: a.status,
        position: a.position,
        applicationDate: a.applicationDate,
        createdAt: a.createdAt,
        adminNote: a.adminNote || "",
      }));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = u;
    return {
      ...rest,
      roleName: role?.name || "Member",
      roleRank: roleRank(role),
      permissions: role?.permissions || [],
      bookingCount: bookings.length,
      leagueSignupCount: leagueSignups.length,
      employmentCount: employmentApps.length,
      bookings,
      leagueSignups,
      employmentApps,
    };
  });

  return NextResponse.json({ users, actorRank: user?.roleRank ?? 999 });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_users") || !user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = String(body.userId || "");
    const roleId = String(body.roleId || "");
    const actorRank = user.roleRank ?? 999;

    const { store } = await updateStore((s) => {
      const target = s.users.find((u) => u.id === userId);
      if (!target) throw new Error("User not found");
      const newRole = s.roles.find((r) => r.id === roleId);
      if (!newRole) throw new Error("Role not found");
      const currentRole = s.roles.find((r) => r.id === target.roleId);

      if (roleRank(currentRole) <= actorRank) {
        throw new Error("You cannot change a user at or above your level.");
      }
      if (roleRank(newRole) <= actorRank) {
        throw new Error("You cannot assign a role at or above your level.");
      }

      if (
        target.roleId === WEBSITE_OWNER_ROLE_ID &&
        roleId !== WEBSITE_OWNER_ROLE_ID
      ) {
        const owners = s.users.filter((u) => u.roleId === WEBSITE_OWNER_ROLE_ID);
        if (owners.length <= 1) {
          throw new Error("Cannot remove the only Website Owner.");
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

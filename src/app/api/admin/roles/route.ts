import { NextResponse } from "next/server";
import {
  getCurrentUser,
  hasPermission,
  sanitizeAssignablePermissions,
} from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import {
  WEBSITE_OWNER_ROLE_ID,
  WEBSITE_OWNER_ROLE_NAME,
  canManageRole,
  nextRankBelow,
  roleRank,
} from "@/lib/roles";
import { makeId } from "@/lib/ids";
import type { Permission } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_roles") && !hasPermission(user, "manage_users")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  const roles = [...store.roles].sort(
    (a, b) => roleRank(a) - roleRank(b) || a.name.localeCompare(b.name),
  );
  return NextResponse.json({
    roles,
    actorRank: user?.roleRank ?? 999,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_roles") || !user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const permissions = sanitizeAssignablePermissions(
      Array.isArray(body.permissions) ? (body.permissions as Permission[]) : [],
    );
    const actorRank = user.roleRank ?? 999;
    let rank =
      typeof body.rank === "number" ? Number(body.rank) : nextRankBelow(actorRank, []);

    if (!name) {
      return NextResponse.json({ error: "Role name is required." }, { status: 400 });
    }
    if (permissions.length === 0) {
      return NextResponse.json(
        { error: "Select at least one permission for this role." },
        { status: 400 },
      );
    }
    if (rank <= actorRank) {
      return NextResponse.json(
        { error: "You can only create roles below your authority level." },
        { status: 403 },
      );
    }

    const role = {
      id: makeId("role"),
      name,
      description,
      permissions,
      rank,
      locked: false,
    };

    const { store } = await updateStore((s) => {
      if (s.roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("A role with that name already exists.");
      }
      if (typeof body.rank !== "number") {
        role.rank = nextRankBelow(actorRank, s.roles);
      }
      s.roles.push(role);
      s.roles.sort((a, b) => roleRank(a) - roleRank(b));
    });

    return NextResponse.json({ roles: store.roles, role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create role";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_roles") || !user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "");
    const actorRank = user.roleRank ?? 999;

    const { store } = await updateStore((s) => {
      const role = s.roles.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");

      if (!canManageRole(actorRank, role) && role.id !== WEBSITE_OWNER_ROLE_ID) {
        // Website Owner may edit any role; others only weaker roles
        if (actorRank > 0) {
          throw new Error("You cannot edit a role at or above your level.");
        }
      }
      if (actorRank > 0 && !canManageRole(actorRank, role)) {
        throw new Error("You cannot edit a role at or above your level.");
      }

      if (role.id === WEBSITE_OWNER_ROLE_ID || role.locked && role.name === WEBSITE_OWNER_ROLE_NAME) {
        if (actorRank !== 0) {
          throw new Error("Only the Website Owner can change that role.");
        }
        if (body.permissions) {
          role.permissions = sanitizeAssignablePermissions(
            body.permissions as Permission[],
          );
        }
        if (body.description !== undefined) {
          role.description = String(body.description);
        }
        role.name = WEBSITE_OWNER_ROLE_NAME;
        role.rank = 0;
        role.locked = true;
        return;
      }

      if (body.name !== undefined && !role.locked) role.name = String(body.name);
      if (body.description !== undefined) role.description = String(body.description);
      if (body.permissions !== undefined) {
        role.permissions = sanitizeAssignablePermissions(
          body.permissions as Permission[],
        );
      }
      if (typeof body.rank === "number") {
        const next = Number(body.rank);
        if (next <= actorRank) {
          throw new Error("Role order must stay below your authority level.");
        }
        role.rank = next;
      }
      s.roles.sort((a, b) => roleRank(a) - roleRank(b));
    });
    return NextResponse.json({ roles: store.roles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_roles") || !user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Role id required." }, { status: 400 });
  }

  try {
    const actorRank = user.roleRank ?? 999;
    const { store } = await updateStore((s) => {
      const role = s.roles.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");
      if (role.locked) throw new Error("This role cannot be deleted.");
      if (!canManageRole(actorRank, role)) {
        throw new Error("You cannot delete a role at or above your level.");
      }
      if (s.users.some((u) => u.roleId === id)) {
        throw new Error("Reassign users before deleting this role.");
      }
      s.roles = s.roles.filter((r) => r.id !== id);
    });
    return NextResponse.json({ roles: store.roles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

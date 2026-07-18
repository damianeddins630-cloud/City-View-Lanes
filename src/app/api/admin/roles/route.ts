import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { makeId } from "@/lib/ids";
import type { Permission } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_roles") && !hasPermission(user, "manage_users")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  return NextResponse.json({ roles: store.roles });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_roles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const permissions = Array.isArray(body.permissions)
      ? (body.permissions as Permission[])
      : [];

    if (!name) {
      return NextResponse.json({ error: "Role name is required." }, { status: 400 });
    }

    const role = {
      id: makeId("role"),
      name,
      description,
      permissions,
      locked: false,
    };

    const { store } = await updateStore((s) => {
      if (s.roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("A role with that name already exists.");
      }
      s.roles.push(role);
    });

    return NextResponse.json({ roles: store.roles, role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create role";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_roles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "");
    const { store } = await updateStore((s) => {
      const role = s.roles.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");
      if (role.locked && role.name === "Master Admin") {
        // Allow permission edits only for non-locked fields except Master Admin stay full
        if (body.permissions) {
          role.permissions = body.permissions as Permission[];
        }
        if (body.description !== undefined) {
          role.description = String(body.description);
        }
        return;
      }
      if (body.name !== undefined && !role.locked) role.name = String(body.name);
      if (body.description !== undefined) role.description = String(body.description);
      if (body.permissions !== undefined) {
        role.permissions = body.permissions as Permission[];
      }
    });
    return NextResponse.json({ roles: store.roles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_roles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Role id required." }, { status: 400 });
  }

  try {
    const { store } = await updateStore((s) => {
      const role = s.roles.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");
      if (role.locked) throw new Error("This role cannot be deleted.");
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

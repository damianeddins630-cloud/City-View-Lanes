import type { Permission, Role, Store } from "./types";

export const WEBSITE_OWNER_ROLE_ID = "role_master_admin";
export const WEBSITE_OWNER_ROLE_NAME = "Website Owner";

const OWNER_PERMISSIONS: Permission[] = [
  "manage_users",
  "manage_roles",
  "admin_chat",
  "manage_bookings",
  "manage_league_signups",
  "manage_leagues",
  "manage_hours",
  "view_admins",
  "manage_employment",
  "manage_content",
];

export function roleRank(role: Role | undefined | null): number {
  if (!role) return 999;
  if (typeof role.rank === "number") return role.rank;
  if (role.id === WEBSITE_OWNER_ROLE_ID || role.name === "Master Admin") return 0;
  if (role.name === "Website Owner") return 0;
  if (role.name === "Admin") return 10;
  if (role.name === "Member") return 100;
  return 50;
}

/** True if actor may assign/edit targetRole (target must be strictly weaker). */
export function canManageRole(
  actorRank: number,
  targetRole: Role | undefined | null,
): boolean {
  return roleRank(targetRole) > actorRank;
}

/** Normalize roles/ranks and rename Master Admin → Website Owner. */
export function ensureRoles(store: Store): Store {
  if (!Array.isArray(store.roles)) store.roles = [];

  let owner = store.roles.find((r) => r.id === WEBSITE_OWNER_ROLE_ID);
  if (!owner) {
    owner = store.roles.find(
      (r) => r.name === "Master Admin" || r.name === "Website Owner",
    );
  }

  if (!owner) {
    store.roles.unshift({
      id: WEBSITE_OWNER_ROLE_ID,
      name: WEBSITE_OWNER_ROLE_NAME,
      description: "Full website access — cannot be deleted or outranked",
      permissions: [...OWNER_PERMISSIONS],
      rank: 0,
      locked: true,
    });
  } else {
    owner.id = WEBSITE_OWNER_ROLE_ID;
    owner.name = WEBSITE_OWNER_ROLE_NAME;
    owner.description =
      owner.description || "Full website access — cannot be deleted or outranked";
    owner.locked = true;
    owner.rank = 0;
    const missing = OWNER_PERMISSIONS.filter((p) => !owner!.permissions.includes(p));
    if (missing.length) owner.permissions = [...owner.permissions, ...missing];
  }

  for (const role of store.roles) {
    if (typeof role.rank !== "number") {
      role.rank = roleRank(role);
    }
    // Drop legacy "Access admin panel" flag — access is granted by capabilities.
    role.permissions = role.permissions.filter((p) => p !== "view_admin");
    if (role.id === "role_admin" || role.name === "Admin") {
      const extras: Permission[] = ["manage_employment", "manage_content"];
      for (const p of extras) {
        if (!role.permissions.includes(p)) {
          role.permissions = [...role.permissions, p];
        }
      }
      if (typeof role.rank !== "number" || role.rank < 1) role.rank = 10;
    }
    if (role.id === "role_member" || role.name === "Member") {
      role.rank = 100;
      role.locked = true;
    }
  }

  // Keep sorted by rank for admin UI
  store.roles.sort((a, b) => roleRank(a) - roleRank(b) || a.name.localeCompare(b.name));
  return store;
}

export function nextRankBelow(actorRank: number, roles: Role[]): number {
  const weaker = roles
    .map((r) => roleRank(r))
    .filter((r) => r > actorRank)
    .sort((a, b) => a - b);
  if (weaker.length) return Math.min(actorRank + 10, weaker[0]);
  return Math.min(actorRank + 10, 90);
}

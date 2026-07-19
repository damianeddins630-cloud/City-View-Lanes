import { ASSIGNABLE_PERMISSION_IDS } from "./site";
import type { Permission, PublicUser } from "./types";

const ADMIN_CAPABILITY_SET = new Set<string>(ASSIGNABLE_PERMISSION_IDS);

/** Admin access = any real capability. Not a separate "Access admin panel" flag. */
export function canAccessAdminPanel(
  user: Pick<PublicUser, "permissions"> | null | undefined,
): boolean {
  if (!user?.permissions?.length) return false;
  return user.permissions.some((p) => ADMIN_CAPABILITY_SET.has(p));
}

export function sanitizeAssignablePermissions(
  permissions: Permission[],
): Permission[] {
  const allowed = new Set<string>(ASSIGNABLE_PERMISSION_IDS);
  return [...new Set(permissions.filter((p) => allowed.has(p)))] as Permission[];
}

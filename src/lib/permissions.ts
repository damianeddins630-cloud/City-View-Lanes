import { ASSIGNABLE_PERMISSION_IDS } from "./site";
import type { Permission, PublicUser } from "./types";

/** Capabilities that open /admin (not on-page-only edit). */
const ADMIN_PANEL_PERMISSIONS = new Set<Permission>([
  "manage_users",
  "manage_roles",
  "admin_chat",
  "manage_bookings",
  "manage_league_signups",
  "manage_leagues",
  "view_admins",
  "manage_employment",
]);

const ADMIN_CAPABILITY_SET = new Set<string>(ASSIGNABLE_PERMISSION_IDS);

export type EditablePage = "home" | "leagues" | "hours";

/** Admin dashboard access — Owner always; others need dashboard capabilities. */
export function canAccessAdminPanel(
  user: Pick<PublicUser, "permissions" | "roleId" | "roleName"> | null | undefined,
): boolean {
  if (!user) return false;
  if (
    user.roleId === "role_master_admin" ||
    user.roleName === "Website Owner" ||
    user.roleName === "Master Admin"
  ) {
    return true;
  }
  if (!user.permissions?.length) return false;
  return user.permissions.some((p) => ADMIN_PANEL_PERMISSIONS.has(p as Permission));
}

export function sanitizeAssignablePermissions(
  permissions: Permission[],
): Permission[] {
  const allowed = new Set<string>(ASSIGNABLE_PERMISSION_IDS);
  return [...new Set(permissions.filter((p) => allowed.has(p)))] as Permission[];
}

export function userHasPermission(
  user: Pick<PublicUser, "permissions"> | null | undefined,
  permission: Permission,
): boolean {
  return Boolean(user?.permissions?.includes(permission));
}

/** Umbrella manage_content still grants home + leagues editing. */
export function canEditPage(
  user: Pick<PublicUser, "permissions"> | null | undefined,
  page: EditablePage,
): boolean {
  if (!user?.permissions?.length) return false;
  if (page === "hours") return userHasPermission(user, "manage_hours");
  if (page === "home") {
    return (
      userHasPermission(user, "edit_page_home") ||
      userHasPermission(user, "manage_content")
    );
  }
  if (page === "leagues") {
    return (
      userHasPermission(user, "edit_page_leagues") ||
      userHasPermission(user, "manage_content")
    );
  }
  return false;
}

export function pageFromContentPath(path: string): EditablePage | null {
  const p = path.trim();
  if (!p) return null;
  if (p === "hours" || p.startsWith("hours.")) return "hours";
  if (p.startsWith("youth.") || p.startsWith("edits.leagues.")) return "leagues";
  if (p.startsWith("home.") || p.startsWith("edits.home.") || p.startsWith("edits.")) {
    return "home";
  }
  return null;
}

export function canEditContentPath(
  user: Pick<PublicUser, "permissions"> | null | undefined,
  path: string,
): boolean {
  const page = pageFromContentPath(path);
  if (!page) return false;
  return canEditPage(user, page);
}

export function canUploadSiteImages(
  user: Pick<PublicUser, "permissions"> | null | undefined,
): boolean {
  return (
    canEditPage(user, "home") ||
    canEditPage(user, "leagues") ||
    canEditPage(user, "hours")
  );
}

export function editablePageFromPathname(pathname: string): EditablePage | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/leagues")) return "leagues";
  if (pathname.startsWith("/hours")) return "hours";
  return null;
}

/** @deprecated use canAccessAdminPanel — kept for any stray imports */
export function hasAnyAdminCapability(
  user: Pick<PublicUser, "permissions"> | null | undefined,
): boolean {
  if (!user?.permissions?.length) return false;
  return user.permissions.some((p) => ADMIN_CAPABILITY_SET.has(p));
}

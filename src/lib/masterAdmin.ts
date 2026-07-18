import type { Store, User } from "./types";

/** Canonical live master-admin login (always ensured on store load). */
export const MASTER_ADMIN = {
  id: "usr_master_admin",
  username: "cityview_damian",
  email: "damianeddins630@gmail.com",
  // bcrypt hash of: Archer6!9_20
  passwordHash:
    "$2b$10$WxI7GfJe6RKfn96XT6tEeexExG5QeYZh4AlLR6aHtLqQXRD6Vs3WW",
  firstName: "Damian",
  lastName: "Eddins",
  roleId: "role_master_admin",
} as const;

/** Make sure the master admin account exists with the expected login. */
export function ensureMasterAdmin(store: Store): Store {
  const now = new Date().toISOString();
  const byId = store.users.find((u) => u.id === MASTER_ADMIN.id);
  const byNewName = store.users.find(
    (u) => u.username.toLowerCase() === MASTER_ADMIN.username,
  );
  const byOldName = store.users.find(
    (u) => u.username.toLowerCase() === "masteradmin",
  );

  const target = byId || byNewName || byOldName;

  if (!target) {
    const created: User = {
      id: MASTER_ADMIN.id,
      username: MASTER_ADMIN.username,
      email: MASTER_ADMIN.email,
      passwordHash: MASTER_ADMIN.passwordHash,
      firstName: MASTER_ADMIN.firstName,
      lastName: MASTER_ADMIN.lastName,
      phone: "",
      birthDate: "",
      avatarUrl: "",
      roleId: MASTER_ADMIN.roleId,
      createdAt: now,
      updatedAt: now,
    };
    store.users.unshift(created);
    return store;
  }

  target.id = MASTER_ADMIN.id;
  target.username = MASTER_ADMIN.username;
  target.email = target.email || MASTER_ADMIN.email;
  target.passwordHash = MASTER_ADMIN.passwordHash;
  target.firstName = target.firstName || MASTER_ADMIN.firstName;
  target.lastName = target.lastName || MASTER_ADMIN.lastName;
  target.roleId = MASTER_ADMIN.roleId;
  target.updatedAt = now;

  // Drop duplicate masteradmin row if we merged from another user id.
  store.users = store.users.filter((u, index, arr) => {
    if (u.id === MASTER_ADMIN.id) {
      return arr.findIndex((x) => x.id === MASTER_ADMIN.id) === index;
    }
    if (u.username.toLowerCase() === "masteradmin") return false;
    if (
      u.username.toLowerCase() === MASTER_ADMIN.username &&
      u.id !== MASTER_ADMIN.id
    ) {
      return false;
    }
    return true;
  });

  return store;
}

"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ALL_PERMISSIONS } from "@/lib/site";
import type { DayHours, League, Permission, PublicUser, Role } from "@/lib/types";

type Tab =
  | "users"
  | "roles"
  | "chat"
  | "bookings"
  | "admins"
  | "leagues"
  | "hours";

type AdminUser = PublicUser & {
  bookingCount: number;
  leagueSignupCount: number;
  bookings: Array<{ id: string; status: string; eventType: string; eventDate: string }>;
  leagueSignups: Array<{ id: string; status: string; leagueId: string }>;
};

type BookingRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  partySize: number;
  eventType: string;
  notes: string;
  status: string;
  username: string;
  memberName: string;
  adminNote?: string;
};

type SignupRow = {
  id: string;
  status: string;
  note: string;
  username: string;
  memberName: string;
  memberEmail: string;
  leagueName: string;
  leagueDay: string;
  leagueTime: string;
  adminNote?: string;
};

type ChatRow = {
  id: string;
  body: string;
  createdAt: string;
  username: string;
  displayName: string;
  roleName: string;
};

const TABS: { id: Tab; label: string; permission?: Permission }[] = [
  { id: "users", label: "Users", permission: "manage_users" },
  { id: "roles", label: "Role Manager", permission: "manage_roles" },
  { id: "chat", label: "Admin Chat", permission: "admin_chat" },
  { id: "bookings", label: "Bookings & Leagues", permission: "manage_bookings" },
  { id: "admins", label: "Admins", permission: "view_admins" },
  { id: "leagues", label: "League Manager", permission: "manage_leagues" },
  { id: "hours", label: "Hours", permission: "manage_hours" },
];

export default function AdminClient() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tab, setTab] = useState<Tab>("users");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [signups, setSignups] = useState<SignupRow[]>([]);
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [hours, setHours] = useState<DayHours[]>([]);
  const [chatBody, setChatBody] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
  });

  const [leagueForm, setLeagueForm] = useState({
    day: "Monday",
    time: "7:00 PM",
    name: "",
    type: "Adult",
    teamSize: "4",
    startDate: "",
    meetingInfo: "",
  });

  const can = useCallback(
    (p: Permission) => Boolean(user?.permissions?.includes(p)),
    [user],
  );

  const visibleTabs = useMemo(
    () =>
      TABS.filter(
        (t) =>
          !t.permission ||
          can(t.permission) ||
          (t.id === "bookings" && can("manage_league_signups")),
      ),
    [can],
  );

  const loadAll = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const me = await meRes.json();
    if (!me.user?.permissions?.includes("view_admin")) {
      window.location.href = "/login?next=/admin";
      return;
    }
    setUser(me.user);

    const tasks: Promise<void>[] = [];

    if (me.user.permissions.includes("manage_users") || me.user.permissions.includes("view_admins")) {
      tasks.push(
        fetch("/api/admin/users")
          .then((r) => r.json())
          .then((d) => setUsers(d.users || [])),
      );
    }
    if (me.user.permissions.includes("manage_roles") || me.user.permissions.includes("manage_users")) {
      tasks.push(
        fetch("/api/admin/roles")
          .then((r) => r.json())
          .then((d) => setRoles(d.roles || [])),
      );
    }
    if (me.user.permissions.includes("manage_bookings")) {
      tasks.push(
        fetch("/api/admin/bookings")
          .then((r) => r.json())
          .then((d) => setBookings(d.bookings || [])),
      );
    }
    if (me.user.permissions.includes("manage_league_signups")) {
      tasks.push(
        fetch("/api/admin/league-signups")
          .then((r) => r.json())
          .then((d) => setSignups(d.signups || [])),
      );
    }
    if (me.user.permissions.includes("admin_chat")) {
      tasks.push(
        fetch("/api/admin/chat")
          .then((r) => r.json())
          .then((d) => setMessages(d.messages || [])),
      );
    }
    if (me.user.permissions.includes("manage_leagues")) {
      tasks.push(
        fetch("/api/leagues")
          .then((r) => r.json())
          .then((d) => setLeagues(d.leagues || [])),
      );
    }
    if (me.user.permissions.includes("manage_hours")) {
      tasks.push(
        fetch("/api/hours")
          .then((r) => r.json())
          .then((d) => setHours(d.hours || [])),
      );
    }

    await Promise.all(tasks);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      loadAll().catch(() => {
        if (active) setError("Failed to load admin data.");
      });
    });
    return () => {
      active = false;
    };
  }, [loadAll]);

  const activeTab = visibleTabs.some((t) => t.id === tab)
    ? tab
    : visibleTabs[0]?.id || tab;

  async function assignRole(userId: string, roleId: string) {
    setError("");
    setNotice("");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update role");
      return;
    }
    setNotice("User role updated.");
    await loadAll();
  }

  async function createRole(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roleForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create role");
      return;
    }
    setRoles(data.roles);
    setRoleForm({ name: "", description: "", permissions: [] });
    setNotice("Role created.");
  }

  async function updateRolePermissions(role: Role, permission: Permission, checked: boolean) {
    const permissions = checked
      ? Array.from(new Set([...role.permissions, permission]))
      : role.permissions.filter((p) => p !== permission);
    const res = await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: role.id, permissions }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update role");
      return;
    }
    setRoles(data.roles);
  }

  async function deleteRole(id: string) {
    const res = await fetch(`/api/admin/roles?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not delete role");
      return;
    }
    setRoles(data.roles);
  }

  async function sendChat(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: chatBody }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not send message");
      return;
    }
    setChatBody("");
    const refresh = await fetch("/api/admin/chat").then((r) => r.json());
    setMessages(refresh.messages || []);
  }

  async function decideBooking(id: string, status: "approved" | "denied") {
    const adminNote = window.prompt("Optional note for the email to the member:") || "";
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNote }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
    setNotice(`Booking ${status}. Email queued to member.`);
    await loadAll();
  }

  async function decideSignup(id: string, status: "approved" | "denied") {
    const adminNote = window.prompt("Optional note for the email to the member:") || "";
    const res = await fetch("/api/admin/league-signups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNote }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
    setNotice(`League signup ${status}. Email queued to member.`);
    await loadAll();
  }

  async function addLeague(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/leagues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leagueForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not add league");
      return;
    }
    setLeagues(data.leagues);
    setLeagueForm({
      day: "Monday",
      time: "7:00 PM",
      name: "",
      type: "Adult",
      teamSize: "4",
      startDate: "",
      meetingInfo: "",
    });
    setNotice("League added.");
  }

  async function removeLeague(id: string) {
    const res = await fetch(`/api/leagues?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not remove league");
      return;
    }
    setLeagues(data.leagues);
  }

  async function saveHours(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save hours");
      return;
    }
    setHours(data.hours);
    setNotice("Hours updated.");
  }

  const admins = useMemo(() => {
    return users
      .filter((u) => u.permissions?.length || u.roleName !== "Member")
      .sort((a, b) => a.roleName.localeCompare(b.roleName) || a.username.localeCompare(b.username));
  }, [users]);

  if (!user) {
    return <p className="mt-8 text-sm text-[var(--muted)]">Checking access…</p>;
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-[var(--muted)]">
        Signed in as <strong>{user.username}</strong> · {user.roleName}
      </p>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setError("");
              setNotice("");
            }}
            className={`px-3 py-2 text-xs font-bold tracking-wide uppercase ${
              activeTab === t.id
                ? "bg-[var(--navy)] text-white"
                : "bg-white text-[var(--muted)] border border-[var(--line)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm font-semibold text-[var(--blue)]">{notice}</p> : null}

      {activeTab === "users" && can("manage_users") ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-x-auto border border-[var(--line)] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--blue-soft)] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Bookings</th>
                  <th className="px-3 py-3">Leagues</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="cursor-pointer border-t border-[var(--line)] hover:bg-[var(--blue-soft)]/50"
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-[var(--navy)]">{u.username}</p>
                      <p className="text-xs text-[var(--muted)]">{u.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={u.roleId}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => assignRole(u.id, e.target.value)}
                        className="border border-[var(--line)] px-2 py-1"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">{u.bookingCount}</td>
                    <td className="px-3 py-3">{u.leagueSignupCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel p-5">
            <h2 className="font-display text-2xl text-[var(--navy)]">User profile</h2>
            {selectedUser ? (
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.phone || "—"}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.roleName}
                </p>
                <p>
                  <strong>Bookings:</strong> {selectedUser.bookingCount}
                </p>
                <ul className="ml-4 list-disc text-[var(--muted)]">
                  {selectedUser.bookings.map((b) => (
                    <li key={b.id}>
                      {b.eventType} · {b.eventDate} · {b.status}
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>League signups:</strong> {selectedUser.leagueSignupCount}
                </p>
                <ul className="ml-4 list-disc text-[var(--muted)]">
                  {selectedUser.leagueSignups.map((s) => (
                    <li key={s.id}>
                      {s.leagueId} · {s.status}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">Select a user to view details.</p>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "roles" && can("manage_roles") ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form onSubmit={createRole} className="panel grid gap-3 p-5">
            <h2 className="font-display text-2xl text-[var(--navy)]">Add role</h2>
            <div className="field">
              <label>Role name</label>
              <input
                required
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Description</label>
              <input
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              {ALL_PERMISSIONS.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={roleForm.permissions.includes(p.id)}
                    onChange={(e) => {
                      setRoleForm((f) => ({
                        ...f,
                        permissions: e.target.checked
                          ? [...f.permissions, p.id]
                          : f.permissions.filter((x) => x !== p.id),
                      }));
                    }}
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <button type="submit" className="btn btn-primary w-fit">
              Create role
            </button>
          </form>

          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-[var(--navy)]">{role.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{role.description}</p>
                  </div>
                  {!role.locked ? (
                    <button
                      type="button"
                      className="text-xs font-bold text-red-700 uppercase"
                      onClick={() => deleteRole(role.id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 grid gap-1">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={role.permissions.includes(p.id)}
                        disabled={role.name === "Master Admin"}
                        onChange={(e) =>
                          updateRolePermissions(role, p.id, e.target.checked)
                        }
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "chat" && can("admin_chat") ? (
        <div className="mt-6 panel p-5">
          <h2 className="font-display text-2xl text-[var(--navy)]">Admin chat</h2>
          <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto border border-[var(--line)] bg-[var(--bg)] p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="border border-[var(--line)] bg-white p-3">
                  <p className="text-xs font-bold tracking-wide text-[var(--blue)] uppercase">
                    {m.displayName} · {m.roleName} ·{" "}
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm">{m.body}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={sendChat} className="mt-4 flex gap-2">
            <input
              className="min-h-11 flex-1 border border-[var(--line)] px-3"
              value={chatBody}
              onChange={(e) => setChatBody(e.target.value)}
              placeholder="Message all admins…"
              required
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </div>
      ) : null}

      {activeTab === "bookings" ? (
        <div className="mt-6 space-y-8">
          {can("manage_bookings") ? (
            <div>
              <h2 className="font-display text-2xl text-[var(--navy)]">Bookings</h2>
              <div className="mt-3 overflow-x-auto border border-[var(--line)] bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--blue-soft)] text-xs uppercase">
                    <tr>
                      <th className="px-3 py-3">Guest</th>
                      <th className="px-3 py-3">When</th>
                      <th className="px-3 py-3">Party</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-[var(--muted)]">
                          No bookings yet.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="border-t border-[var(--line)]">
                          <td className="px-3 py-3">
                            <p className="font-semibold">
                              {b.firstName} {b.lastName}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              {b.email} · {b.phone}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            {b.eventDate} {b.eventTime}
                          </td>
                          <td className="px-3 py-3">
                            {b.eventType} · {b.partySize}
                          </td>
                          <td className="px-3 py-3 uppercase">{b.status}</td>
                          <td className="px-3 py-3">
                            {b.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-primary text-[10px]"
                                  onClick={() => decideBooking(b.id, "approved")}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost text-[10px]"
                                  onClick={() => decideBooking(b.id, "denied")}
                                >
                                  Deny
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-[var(--muted)]">Done</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {can("manage_league_signups") ? (
            <div>
              <h2 className="font-display text-2xl text-[var(--navy)]">
                League signups
              </h2>
              <div className="mt-3 overflow-x-auto border border-[var(--line)] bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--blue-soft)] text-xs uppercase">
                    <tr>
                      <th className="px-3 py-3">Member</th>
                      <th className="px-3 py-3">League</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signups.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-[var(--muted)]">
                          No league signups yet.
                        </td>
                      </tr>
                    ) : (
                      signups.map((s) => (
                        <tr key={s.id} className="border-t border-[var(--line)]">
                          <td className="px-3 py-3">
                            <p className="font-semibold">{s.memberName || s.username}</p>
                            <p className="text-xs text-[var(--muted)]">{s.memberEmail}</p>
                          </td>
                          <td className="px-3 py-3">
                            {s.leagueName}
                            <br />
                            <span className="text-xs text-[var(--muted)]">
                              {s.leagueDay} {s.leagueTime}
                            </span>
                          </td>
                          <td className="px-3 py-3 uppercase">{s.status}</td>
                          <td className="px-3 py-3">
                            {s.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-primary text-[10px]"
                                  onClick={() => decideSignup(s.id, "approved")}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost text-[10px]"
                                  onClick={() => decideSignup(s.id, "denied")}
                                >
                                  Deny
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-[var(--muted)]">Done</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "admins" && can("view_admins") ? (
        <div className="mt-6 overflow-x-auto border border-[var(--line)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--blue-soft)] text-xs uppercase">
              <tr>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Username</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t border-[var(--line)]">
                  <td className="px-3 py-3 font-semibold text-[var(--navy)]">
                    {a.roleName}
                  </td>
                  <td className="px-3 py-3">{a.username}</td>
                  <td className="px-3 py-3">
                    {a.firstName} {a.lastName}
                  </td>
                  <td className="px-3 py-3">{a.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {activeTab === "leagues" && can("manage_leagues") ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form onSubmit={addLeague} className="panel grid gap-3 p-5">
            <h2 className="font-display text-2xl text-[var(--navy)]">Add league</h2>
            <div className="field">
              <label>Name</label>
              <input
                required
                value={leagueForm.name}
                onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label>Day</label>
                <select
                  value={leagueForm.day}
                  onChange={(e) => setLeagueForm({ ...leagueForm, day: e.target.value })}
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                    (d) => (
                      <option key={d}>{d}</option>
                    ),
                  )}
                </select>
              </div>
              <div className="field">
                <label>Time</label>
                <input
                  required
                  value={leagueForm.time}
                  onChange={(e) => setLeagueForm({ ...leagueForm, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label>Type</label>
                <input
                  value={leagueForm.type}
                  onChange={(e) => setLeagueForm({ ...leagueForm, type: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Team size</label>
                <input
                  value={leagueForm.teamSize}
                  onChange={(e) =>
                    setLeagueForm({ ...leagueForm, teamSize: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="field">
              <label>Start date</label>
              <input
                value={leagueForm.startDate}
                onChange={(e) =>
                  setLeagueForm({ ...leagueForm, startDate: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Meeting info</label>
              <input
                value={leagueForm.meetingInfo}
                onChange={(e) =>
                  setLeagueForm({ ...leagueForm, meetingInfo: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-primary w-fit">
              Add league
            </button>
          </form>

          <div className="space-y-3">
            {leagues.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No leagues yet.</p>
            ) : (
              leagues.map((l) => (
                <div key={l.id} className="panel flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-[var(--navy)]">{l.name}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {l.day} · {l.time} · {l.type} · Team {l.teamSize}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-red-700 uppercase"
                    onClick={() => removeLeague(l.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "hours" && can("manage_hours") ? (
        <form onSubmit={saveHours} className="mt-6 panel max-w-2xl space-y-3 p-5">
          <h2 className="font-display text-2xl text-[var(--navy)]">Edit open hours</h2>
          {hours.map((h, idx) => (
            <div key={h.day} className="grid grid-cols-[1fr_1fr_1fr] items-center gap-3">
              <p className="font-semibold text-[var(--navy)]">{h.day}</p>
              <input
                value={h.open}
                onChange={(e) => {
                  const next = [...hours];
                  next[idx] = { ...h, open: e.target.value };
                  setHours(next);
                }}
                className="border border-[var(--line)] px-2 py-2"
              />
              <input
                value={h.close}
                onChange={(e) => {
                  const next = [...hours];
                  next[idx] = { ...h, close: e.target.value };
                  setHours(next);
                }}
                className="border border-[var(--line)] px-2 py-2"
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary">
            Save hours
          </button>
        </form>
      ) : null}
    </div>
  );
}

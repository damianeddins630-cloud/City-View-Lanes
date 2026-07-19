"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AdminContentEditor from "@/components/AdminContentEditor";
import { ALL_PERMISSIONS } from "@/lib/site";
import type {
  DayHours,
  EmploymentApplication,
  League,
  Permission,
  PublicUser,
  Role,
} from "@/lib/types";

type Tab =
  | "users"
  | "roles"
  | "chat"
  | "bookings"
  | "employment"
  | "admins"
  | "leagues"
  | "hours"
  | "content";

type AdminUser = PublicUser & {
  bookingCount: number;
  leagueSignupCount: number;
  bookings: Array<{
    id: string;
    status: string;
    eventType: string;
    eventDate: string;
    eventTime?: string;
    partySize?: number;
    phone?: string;
    email?: string;
    notes?: string;
    createdAt?: string;
    adminNote?: string;
  }>;
  leagueSignups: Array<{
    id: string;
    status: string;
    leagueId: string;
    leagueName?: string;
    leagueDay?: string;
    leagueTime?: string;
    note?: string;
    createdAt?: string;
    adminNote?: string;
  }>;
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
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  email?: string;
  teamName?: string;
  fullTeam?: string;
  teamCount?: string;
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
  { id: "content", label: "Pictures & Text", permission: "manage_content" },
  { id: "chat", label: "Admin Chat", permission: "admin_chat" },
  { id: "bookings", label: "Party & League Apps", permission: "manage_bookings" },
  { id: "employment", label: "Employment", permission: "manage_employment" },
  { id: "admins", label: "Admins", permission: "view_admins" },
  { id: "leagues", label: "League Manager", permission: "manage_leagues" },
  { id: "hours", label: "Hours", permission: "manage_hours" },
];

function isWebsiteOwnerRole(role: Role) {
  return role.name === "Website Owner" || role.id === "role_master_admin";
}

export default function AdminClient() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tab, setTab] = useState<Tab>("users");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [storage, setStorage] = useState<{
    durable: boolean;
    persistence: string;
    hasBlobToken: boolean | null;
    hasBlobStoreId: boolean | null;
    blobAuthMethod: string | null;
    blobCanAttempt: boolean | null;
    blobLastError: string | null;
  }>({
    durable: true,
    persistence: "checking",
    hasBlobToken: null,
    hasBlobStoreId: null,
    blobAuthMethod: null,
    blobCanAttempt: null,
    blobLastError: null,
  });
  const [storageTest, setStorageTest] = useState<{
    running: boolean;
    message: string;
  }>({ running: false, message: "" });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [signups, setSignups] = useState<SignupRow[]>([]);
  const [employmentApps, setEmploymentApps] = useState<
    Array<
      EmploymentApplication & {
        username?: string;
        memberName?: string;
      }
    >
  >([]);
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [hours, setHours] = useState<DayHours[]>([]);
  const [chatBody, setChatBody] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detail, setDetail] = useState<
    | { kind: "party"; data: BookingRow }
    | { kind: "league"; data: SignupRow }
    | {
        kind: "employment";
        data: EmploymentApplication & {
          username?: string;
          memberName?: string;
        };
      }
    | null
  >(null);

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
    rank: 50,
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

    const tasks: Promise<void>[] = [
      fetch("/api/storage")
        .then((r) => r.json())
        .then((d) =>
          setStorage({
            durable: Boolean(d.durable),
            persistence: String(d.persistence || "unknown"),
            hasBlobToken:
              typeof d.hasBlobToken === "boolean" ? d.hasBlobToken : null,
            hasBlobStoreId:
              typeof d.hasBlobStoreId === "boolean" ? d.hasBlobStoreId : null,
            blobAuthMethod:
              typeof d.blobAuthMethod === "string" ? d.blobAuthMethod : null,
            blobCanAttempt:
              typeof d.blobCanAttempt === "boolean" ? d.blobCanAttempt : null,
            blobLastError:
              typeof d.blobLastError === "string" ? d.blobLastError : null,
          }),
        )
        .catch(() =>
          setStorage({
            durable: false,
            persistence: "unknown",
            hasBlobToken: false,
            hasBlobStoreId: false,
            blobAuthMethod: "none",
            blobCanAttempt: false,
            blobLastError: null,
          }),
        ),
    ];

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
    if (me.user.permissions.includes("manage_employment")) {
      tasks.push(
        fetch("/api/admin/employment")
          .then((r) => r.json())
          .then((d) => setEmploymentApps(d.applications || [])),
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
    setRoleForm({ name: "", description: "", permissions: [], rank: 50 });
    setNotice("Role created.");
  }

  async function updateRolePermissions(role: Role, permission: Permission, checked: boolean) {
    const permissions = checked
      ? Array.from(new Set([...role.permissions, permission]))
      : role.permissions.filter((p) => p !== permission);
    const res = await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: role.id, permissions, rank: role.rank }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update role");
      return;
    }
    setRoles(data.roles);
  }

  async function updateRoleRank(role: Role, rank: number) {
    const res = await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: role.id,
        permissions: role.permissions,
        rank,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not update role rank");
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
    setDetail(null);
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
    setDetail(null);
    await loadAll();
  }

  async function decideEmployment(id: string, status: "approved" | "denied") {
    const adminNote = window.prompt("Optional note for the email to the member:") || "";
    const res = await fetch("/api/admin/employment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNote }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
    setNotice(`Employment application ${status}. Email queued to member.`);
    setDetail(null);
    await loadAll();
  }

  function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="border-b border-[var(--line)] py-2 sm:grid sm:grid-cols-[160px_1fr] sm:gap-3">
        <p className="text-xs font-semibold tracking-wide text-[var(--blue-bright)] uppercase">
          {label}
        </p>
        <p className="text-sm whitespace-pre-wrap text-[var(--ink)]">{String(value)}</p>
      </div>
    );
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
    setError("");
    setNotice("");
    const res = await fetch("/api/hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || data.help || "Could not save hours");
      setStorage((s) => ({
        ...s,
        durable: false,
        persistence: data.persistence || s.persistence,
        blobLastError:
          typeof data.blobError === "string" ? data.blobError : s.blobLastError,
      }));
      return;
    }
    setHours(data.hours);
    setStorage((s) => ({
      ...s,
      durable: Boolean(data.durable),
      persistence: data.persistence || "unknown",
    }));
    if (data.durable) {
      setNotice("Hours saved. Open /hours to confirm — they will stay.");
    } else {
      setError(
        "Hours did NOT save permanently. In Vercel go to Storage → Blob → Connect to this project, then Redeploy.",
      );
    }
  }

  async function runStorageTest() {
    setStorageTest({ running: true, message: "Testing Blob save…" });
    setError("");
    try {
      const res = await fetch("/api/storage", { method: "POST" });
      const data = await res.json();
      setStorage((s) => ({
        ...s,
        durable: Boolean(data.durable),
        persistence: String(data.persistence || s.persistence),
        hasBlobToken:
          typeof data.auth?.hasReadWriteToken === "boolean"
            ? data.auth.hasReadWriteToken
            : s.hasBlobToken,
        hasBlobStoreId:
          typeof data.auth?.hasStoreId === "boolean"
            ? data.auth.hasStoreId
            : s.hasBlobStoreId,
        blobAuthMethod:
          typeof data.auth?.method === "string"
            ? data.auth.method
            : s.blobAuthMethod,
        blobCanAttempt:
          typeof data.auth?.canAttempt === "boolean"
            ? data.auth.canAttempt
            : s.blobCanAttempt,
      }));
      if (data.ok) {
        setStorageTest({
          running: false,
          message: `PASS — Blob write + read worked (${data.access || "ok"}). Saves will stick.`,
        });
        setNotice("Storage test passed. Saves are durable.");
      } else {
        const failDetail = data.error || data.help || "Blob not working on this deploy.";
        setStorageTest({
          running: false,
          message: `FAIL — ${failDetail}`,
        });
        setStorage((s) => ({
          ...s,
          blobLastError: typeof data.error === "string" ? data.error : s.blobLastError,
        }));
        setError(failDetail);
      }
    } catch {
      setStorageTest({
        running: false,
        message: "FAIL — could not reach /api/storage.",
      });
      setError("Storage test failed to run.");
    }
  }

  const admins = useMemo(() => {
    return users
      .filter((u) => u.permissions?.length || u.roleName !== "Member")
      .sort((a, b) => a.roleName.localeCompare(b.roleName) || a.username.localeCompare(b.username));
  }, [users]);

  const myRecord = useMemo(
    () => users.find((u) => u.id === user?.id) || null,
    [users, user],
  );

  if (!user) {
    return <p className="mt-8 text-sm text-[var(--muted)]">Checking access…</p>;
  }

  return (
    <div className="mt-8">
      <div
        className={`mb-4 border px-4 py-3 text-sm ${
          storage.durable
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
            : "border-amber-400/40 bg-amber-500/10 text-amber-100"
        }`}
      >
        {storage.durable ? (
          <>
            <strong>Saves are on.</strong> Storage mode:{" "}
            <code>{storage.persistence}</code>
            {storage.blobAuthMethod ? (
              <>
                {" "}
                (auth: <code>{storage.blobAuthMethod}</code>)
              </>
            ) : null}
            . Hours, profiles, bookings, and leagues will stick after you save.
          </>
        ) : (
          <>
            <strong>Saves are NOT permanent yet.</strong>{" "}
            {storage.blobCanAttempt || storage.persistence === "blob"
              ? "Blob is connected, but writing data failed."
              : "This deployment has no working Blob credentials."}
            <br />
            Looking for <code>BLOB_STORE_ID</code>
            {storage.hasBlobStoreId === false
              ? " (missing)"
              : storage.hasBlobStoreId
                ? " (found)"
                : ""}
            {" "}and/or <code>BLOB_READ_WRITE_TOKEN</code>
            {storage.hasBlobToken === false
              ? " (missing)"
              : storage.hasBlobToken
                ? " (found)"
                : ""}
            .
            <br />
            Fix:
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Open the <strong>same</strong> Vercel project as this live URL
              </li>
              <li>
                <strong>Storage → Blob → Create/Connect</strong> (Private is fine)
              </li>
              <li>
                Settings → Environment Variables → confirm Production has{" "}
                <code>BLOB_STORE_ID</code> or <code>BLOB_READ_WRITE_TOKEN</code>
              </li>
              <li>
                <strong>Deployments → … → Redeploy</strong>
              </li>
              <li>
                Click <strong>Test save now</strong> below
              </li>
            </ol>
            Current mode: <code>{storage.persistence}</code>
            {storage.blobLastError ? (
              <>
                <br />
                Blob error: <code className="break-all">{storage.blobLastError}</code>
              </>
            ) : null}
          </>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={storageTest.running}
            onClick={() => void runStorageTest()}
          >
            {storageTest.running ? "Testing…" : "Test save now"}
          </button>
          {storageTest.message ? (
            <span className="text-xs opacity-90">{storageTest.message}</span>
          ) : null}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="silver-bar" />
        <div className="grid gap-6 p-5 md:grid-cols-[120px_1fr_auto] md:items-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden border border-[var(--line)] bg-[var(--blue-soft)] md:mx-0">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-[var(--blue)]">
                {(user.firstName || user.username || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
              Signed-in admin profile
            </p>
            <h2 className="font-display mt-1 text-3xl tracking-[0.04em] text-[var(--ink)]">
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              @{user.username} · {user.roleName}
            </p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold text-[var(--ink)]">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold text-[var(--ink)]">Phone:</span>{" "}
                {user.phone || "—"}
              </p>
              <p>
                <span className="font-semibold text-[var(--ink)]">Birth date:</span>{" "}
                {user.birthDate || "—"}
              </p>
              <p>
                <span className="font-semibold text-[var(--ink)]">Member since:</span>{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                <span className="font-semibold text-[var(--ink)]">Last updated:</span>{" "}
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : "—"}
              </p>
              <p>
                <span className="font-semibold text-[var(--ink)]">Permissions:</span>{" "}
                {user.permissions.length}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:w-56">
            <div className="stat-chip">
              <p className="font-display text-2xl text-[var(--blue)]">
                {myRecord?.bookingCount ?? 0}
              </p>
              <p className="text-[11px] font-bold tracking-wide text-[var(--muted)] uppercase">
                My bookings
              </p>
            </div>
            <div className="stat-chip">
              <p className="font-display text-2xl text-[var(--blue)]">
                {myRecord?.leagueSignupCount ?? 0}
              </p>
              <p className="text-[11px] font-bold tracking-wide text-[var(--muted)] uppercase">
                My leagues
              </p>
            </div>
            <div className="stat-chip col-span-2">
              <p className="font-display text-2xl text-[var(--ink)]">{users.length}</p>
              <p className="text-[11px] font-bold tracking-wide text-[var(--muted)] uppercase">
                Total accounts
              </p>
            </div>
          </div>
        </div>
      </div>

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
            className={`admin-tab px-3 py-2 text-xs font-bold tracking-wide uppercase ${
              activeTab === t.id ? "admin-tab-active" : ""
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm font-semibold text-[var(--blue)]">{notice}</p> : null}

      {activeTab === "users" && can("manage_users") ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="panel overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--blue)]/20 text-xs text-white uppercase tracking-wide">
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
                    className={`cursor-pointer border-t border-[var(--line)] hover:bg-[var(--blue-soft)]/60 ${
                      selectedUser?.id === u.id ? "bg-[var(--blue-soft)]" : ""
                    }`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden border border-[var(--line)] bg-white/35 text-xs font-bold text-[var(--blue)]">
                          {u.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            (u.firstName || u.username || "?").slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--ink)]">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            @{u.username} · {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={u.roleId}
                        disabled={(u.roleRank ?? 999) <= (user?.roleRank ?? 999)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => assignRole(u.id, e.target.value)}
                        className="border border-[var(--line)] px-2 py-1 disabled:opacity-60"
                      >
                        {roles
                          .filter((r) => r.rank > (user?.roleRank ?? 999))
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        {!roles.some(
                          (r) =>
                            r.id === u.roleId &&
                            r.rank > (user?.roleRank ?? 999),
                        ) ? (
                          <option value={u.roleId}>{u.roleName}</option>
                        ) : null}
                      </select>
                    </td>
                    <td className="px-3 py-3">{u.bookingCount}</td>
                    <td className="px-3 py-3">{u.leagueSignupCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel overflow-hidden">
            <div className="silver-bar" />
            <div className="p-5">
              <h2 className="font-display text-2xl text-[var(--ink)]">Member profile</h2>
              {selectedUser ? (
                <div className="mt-4 space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-[var(--line)] bg-[var(--blue-soft)]">
                      {selectedUser.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedUser.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-display text-2xl text-[var(--blue)]">
                          {(selectedUser.firstName || selectedUser.username || "?")
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-display text-xl text-[var(--ink)]">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                      <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                        {selectedUser.roleName}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <p>
                      <strong>Username:</strong> @{selectedUser.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedUser.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedUser.phone || "—"}
                    </p>
                    <p>
                      <strong>Birth date:</strong> {selectedUser.birthDate || "—"}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleString()
                        : "—"}
                    </p>
                    <p>
                      <strong>Updated:</strong>{" "}
                      {selectedUser.updatedAt
                        ? new Date(selectedUser.updatedAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-[var(--ink)]">
                      Bookings ({selectedUser.bookingCount})
                    </p>
                    {selectedUser.bookings.length === 0 ? (
                      <p className="mt-1 text-[var(--muted)]">No bookings yet.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {selectedUser.bookings.map((b) => (
                          <li
                            key={b.id}
                            className="border border-[var(--line)] bg-white/35/5 px-3 py-2"
                          >
                            <p className="font-semibold">
                              {b.eventType} · {b.status}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              {b.eventDate} {b.eventTime || ""} · party of{" "}
                              {b.partySize ?? "?"}
                            </p>
                            {b.notes ? (
                              <p className="mt-1 text-xs">{b.notes}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-[var(--ink)]">
                      League signups ({selectedUser.leagueSignupCount})
                    </p>
                    {selectedUser.leagueSignups.length === 0 ? (
                      <p className="mt-1 text-[var(--muted)]">No league signups yet.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {selectedUser.leagueSignups.map((s) => (
                          <li
                            key={s.id}
                            className="border border-[var(--line)] bg-white/35/5 px-3 py-2"
                          >
                            <p className="font-semibold">
                              {s.leagueName || s.leagueId} · {s.status}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              {s.leagueDay} {s.leagueTime}
                              {s.createdAt
                                ? ` · requested ${new Date(s.createdAt).toLocaleDateString()}`
                                : ""}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  Select a user to view their full profile, dates, bookings, and
                  league history.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "roles" && can("manage_roles") ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form onSubmit={createRole} className="panel grid gap-3 p-5">
            <h2 className="font-display text-2xl text-[var(--ink)]">Add role</h2>
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
            <div className="field">
              <label>Rank (lower = higher authority)</label>
              <input
                type="number"
                min={1}
                required
                value={roleForm.rank}
                onChange={(e) =>
                  setRoleForm({
                    ...roleForm,
                    rank: Number(e.target.value) || 50,
                  })
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
            {[...roles]
              .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
              .map((role) => (
              <div key={role.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-[var(--ink)]">
                      {role.name}{" "}
                      <span className="text-sm font-sans text-[var(--muted)]">
                        (rank {role.rank ?? "—"})
                      </span>
                    </h3>
                    <p className="text-sm text-[var(--muted)]">{role.description}</p>
                  </div>
                  {!role.locked && !isWebsiteOwnerRole(role) ? (
                    <button
                      type="button"
                      className="text-xs font-bold text-red-700 uppercase"
                      onClick={() => deleteRole(role.id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 field max-w-[10rem]">
                  <label>Order / rank</label>
                  <input
                    type="number"
                    min={0}
                    value={role.rank ?? 50}
                    disabled={isWebsiteOwnerRole(role)}
                    onChange={(e) => {
                      const rank = Number(e.target.value);
                      setRoles((prev) =>
                        prev.map((r) =>
                          r.id === role.id ? { ...r, rank } : r,
                        ),
                      );
                    }}
                    onBlur={(e) => {
                      if (isWebsiteOwnerRole(role)) return;
                      const rank = Number(e.target.value);
                      if (Number.isNaN(rank)) return;
                      void updateRoleRank(role, rank);
                    }}
                  />
                </div>
                <div className="mt-3 grid gap-1">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={role.permissions.includes(p.id)}
                        disabled={isWebsiteOwnerRole(role)}
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
          <h2 className="font-display text-2xl text-[var(--ink)]">Admin chat</h2>
          <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto border border-[var(--line)] bg-[var(--bg)] p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="border border-[var(--line)] bg-white/35 p-3">
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
              <h2 className="font-display text-2xl text-[var(--ink)]">Party applications</h2>
              <div className="mt-3 overflow-x-auto border border-[var(--line)] bg-white/35">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--blue)]/20 text-xs text-white uppercase">
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
                          No party applications yet.
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
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-ghost text-[10px]"
                                onClick={() => setDetail({ kind: "party", data: b })}
                              >
                                Open
                              </button>
                              {b.status === "pending" ? (
                                <>
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
                                </>
                              ) : (
                                <span className="text-xs text-[var(--muted)]">Done</span>
                              )}
                            </div>
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
              <h2 className="font-display text-2xl text-[var(--ink)]">
                League applications
              </h2>
              <div className="mt-3 overflow-x-auto border border-[var(--line)] bg-white/35">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--blue)]/20 text-xs text-white uppercase">
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
                          No league applications yet.
                        </td>
                      </tr>
                    ) : (
                      signups.map((s) => (
                        <tr key={s.id} className="border-t border-[var(--line)]">
                          <td className="px-3 py-3">
                            <p className="font-semibold">{s.memberName || s.username}</p>
                            <p className="text-xs text-[var(--muted)]">
                              {s.teamName ? `Team: ${s.teamName}` : null}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                              {s.email || s.memberEmail}
                              {s.phone ? ` · ${s.phone}` : ""}
                            </p>
                            {s.address ? (
                              <p className="text-xs text-[var(--muted)]">{s.address}</p>
                            ) : null}
                            {s.fullTeam ? (
                              <p className="text-xs text-[var(--muted)]">
                                Full team: {s.fullTeam}
                                {s.fullTeam === "No" && s.teamCount
                                  ? ` (${s.teamCount} people)`
                                  : ""}
                              </p>
                            ) : null}
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
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-ghost text-[10px]"
                                onClick={() => setDetail({ kind: "league", data: s })}
                              >
                                Open
                              </button>
                              {s.status === "pending" ? (
                                <>
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
                                </>
                              ) : (
                                <span className="text-xs text-[var(--muted)]">Done</span>
                              )}
                            </div>
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

      {activeTab === "employment" && can("manage_employment") ? (
        <div className="mt-6">
          <h2 className="font-display text-2xl text-[var(--ink)]">
            Employment applications
          </h2>
          <div className="mt-3 overflow-x-auto border border-[var(--line)] bg-white/35">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--blue)]/20 text-xs text-white uppercase">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Position</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Address</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employmentApps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-[var(--muted)]"
                    >
                      No employment applications yet.
                    </td>
                  </tr>
                ) : (
                  employmentApps.map((a) => (
                    <tr key={a.id} className="border-t border-[var(--line)]">
                      <td className="px-3 py-3">
                        <p className="font-semibold">
                          {a.firstName} {a.middleName ? `${a.middleName} ` : ""}
                          {a.lastName}
                        </p>
                        {a.username ? (
                          <p className="text-xs text-[var(--muted)]">
                            @{a.username}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold">{a.position || "—"}</p>
                        <p className="text-xs text-[var(--muted)]">
                          Start {a.availableStartDate || "—"} · Pay{" "}
                          {a.desiredPay || "—"} · Employed{" "}
                          {a.currentlyEmployed || "—"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs">{a.email}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {[a.mobilePhone, a.homePhone]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-xs text-[var(--muted)]">
                        {[
                          [a.street, a.apt].filter(Boolean).join(" "),
                          [a.city, a.state].filter(Boolean).join(", "),
                          a.zip,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td className="px-3 py-3 uppercase">{a.status}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-ghost text-[10px]"
                            onClick={() =>
                              setDetail({ kind: "employment", data: a })
                            }
                          >
                            Open
                          </button>
                          {a.status === "pending" ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary text-[10px]"
                                onClick={() =>
                                  decideEmployment(a.id, "approved")
                                }
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost text-[10px]"
                                onClick={() => decideEmployment(a.id, "denied")}
                              >
                                Deny
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">
                              Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "admins" && can("view_admins") ? (
        <div className="mt-6 overflow-x-auto border border-[var(--line)] bg-white/35">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--blue)]/20 text-xs text-white uppercase">
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
                  <td className="px-3 py-3 font-semibold text-[var(--ink)]">
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
            <h2 className="font-display text-2xl text-[var(--ink)]">Add league</h2>
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
                    <p className="font-semibold text-[var(--ink)]">{l.name}</p>
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

      {activeTab === "content" && can("manage_content") ? (
        <AdminContentEditor
          onNotice={(msg) => {
            setNotice(msg);
            setError("");
          }}
          onError={(msg) => {
            setError(msg);
            if (msg) setNotice("");
          }}
        />
      ) : null}

      {activeTab === "hours" && can("manage_hours") ? (
        <form onSubmit={saveHours} className="mt-6 panel max-w-2xl space-y-3 p-5">
          <h2 className="font-display text-2xl text-[var(--ink)]">Edit open hours</h2>
          {hours.map((h, idx) => (
            <div key={h.day} className="grid grid-cols-[1fr_1fr_1fr] items-center gap-3">
              <p className="font-semibold text-[var(--ink)]">{h.day}</p>
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

      {detail ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--black)]/60 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Application details"
          onClick={() => setDetail(null)}
        >
          <div
            className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[var(--blue-bright)] uppercase">
                  {detail.kind === "party"
                    ? "Party application"
                    : detail.kind === "league"
                      ? "League application"
                      : "Employment application"}
                </p>
                <h2 className="font-display text-2xl text-[var(--ink)]">
                  {detail.kind === "employment"
                    ? `${detail.data.firstName} ${detail.data.lastName}`.trim()
                    : detail.kind === "party"
                      ? `${detail.data.firstName} ${detail.data.lastName}`.trim()
                      : detail.data.memberName || detail.data.teamName || "Application"}
                </h2>
              </div>
              <button
                type="button"
                className="btn btn-ghost text-[10px]"
                onClick={() => setDetail(null)}
              >
                Close
              </button>
            </div>

            {detail.kind === "party" ? (
              <div>
                <DetailRow label="Status" value={detail.data.status} />
                <DetailRow label="Account" value={detail.data.username} />
                <DetailRow label="Member" value={detail.data.memberName} />
                <DetailRow label="First name" value={detail.data.firstName} />
                <DetailRow label="Last name" value={detail.data.lastName} />
                <DetailRow label="Email" value={detail.data.email} />
                <DetailRow label="Phone" value={detail.data.phone} />
                <DetailRow label="Event type" value={detail.data.eventType} />
                <DetailRow label="Date" value={detail.data.eventDate} />
                <DetailRow label="Time" value={detail.data.eventTime} />
                <DetailRow label="Party size" value={detail.data.partySize} />
                <DetailRow label="Notes" value={detail.data.notes} />
                <DetailRow label="Admin note" value={detail.data.adminNote} />
              </div>
            ) : null}

            {detail.kind === "league" ? (
              <div>
                <DetailRow label="Status" value={detail.data.status} />
                <DetailRow label="Account" value={detail.data.username} />
                <DetailRow label="Member" value={detail.data.memberName} />
                <DetailRow label="Member email" value={detail.data.memberEmail} />
                <DetailRow label="Team / league name" value={detail.data.teamName} />
                <DetailRow label="First name" value={detail.data.firstName} />
                <DetailRow label="Last name" value={detail.data.lastName} />
                <DetailRow label="Phone" value={detail.data.phone} />
                <DetailRow label="Email" value={detail.data.email} />
                <DetailRow label="Address" value={detail.data.address} />
                <DetailRow label="Full team" value={detail.data.fullTeam} />
                <DetailRow label="How many people" value={detail.data.teamCount} />
                <DetailRow label="League" value={detail.data.leagueName} />
                <DetailRow
                  label="League schedule"
                  value={`${detail.data.leagueDay || ""} ${detail.data.leagueTime || ""}`.trim()}
                />
                <DetailRow label="Note" value={detail.data.note} />
                <DetailRow label="Admin note" value={detail.data.adminNote} />
              </div>
            ) : null}

            {detail.kind === "employment" ? (
              <div>
                <DetailRow label="Status" value={detail.data.status} />
                <DetailRow label="Account" value={detail.data.username} />
                <DetailRow label="Member" value={detail.data.memberName} />
                <DetailRow label="Application date" value={detail.data.applicationDate} />
                <DetailRow label="First name" value={detail.data.firstName} />
                <DetailRow label="Middle name" value={detail.data.middleName} />
                <DetailRow label="Last name" value={detail.data.lastName} />
                <DetailRow
                  label="Address"
                  value={[
                    detail.data.street,
                    detail.data.apt ? `Apt ${detail.data.apt}` : "",
                    `${detail.data.city}, ${detail.data.state} ${detail.data.zip}`,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                />
                <DetailRow
                  label="Alt address"
                  value={
                    detail.data.altStreet
                      ? [
                          detail.data.altStreet,
                          detail.data.altApt ? `Apt ${detail.data.altApt}` : "",
                          `${detail.data.altCity}, ${detail.data.altState} ${detail.data.altZip}`,
                        ]
                          .filter(Boolean)
                          .join("\n")
                      : ""
                  }
                />
                <DetailRow label="Home phone" value={detail.data.homePhone} />
                <DetailRow label="Mobile phone" value={detail.data.mobilePhone} />
                <DetailRow label="Email" value={detail.data.email} />
                <DetailRow label="How heard" value={detail.data.howHeard} />
                <DetailRow label="Position" value={detail.data.position} />
                <DetailRow label="Available start" value={detail.data.availableStartDate} />
                <DetailRow label="Desired pay" value={detail.data.desiredPay} />
                <DetailRow label="Currently employed" value={detail.data.currentlyEmployed} />
                <DetailRow
                  label="High school"
                  value={[
                    detail.data.education?.highSchool?.nameLocation,
                    detail.data.education?.highSchool?.graduateDegree,
                    detail.data.education?.highSchool?.majorSubjects,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
                <DetailRow
                  label="College"
                  value={[
                    detail.data.education?.college?.nameLocation,
                    detail.data.education?.college?.graduateDegree,
                    detail.data.education?.college?.majorSubjects,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
                <DetailRow
                  label="Specialized"
                  value={[
                    detail.data.education?.specialized?.nameLocation,
                    detail.data.education?.specialized?.graduateDegree,
                    detail.data.education?.specialized?.majorSubjects,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
                <DetailRow
                  label="Other education"
                  value={[
                    detail.data.education?.other?.nameLocation,
                    detail.data.education?.other?.graduateDegree,
                    detail.data.education?.other?.majorSubjects,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
                <DetailRow label="Special skills" value={detail.data.specialSkills} />
                {(detail.data.experience || []).map((job, idx) => (
                  <DetailRow
                    key={idx}
                    label={`Job ${idx + 1}`}
                    value={[
                      job.companyName,
                      job.roleTitle,
                      job.location,
                      job.dateEmployed,
                      job.notes,
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  />
                ))}
                <DetailRow label="Admin note" value={detail.data.adminNote} />
                <DetailRow label="Submitted" value={detail.data.createdAt} />
              </div>
            ) : null}

            {detail.data.status === "pending" ? (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
                <button
                  type="button"
                  className="btn btn-primary text-[10px]"
                  onClick={() => {
                    if (detail.kind === "party") decideBooking(detail.data.id, "approved");
                    if (detail.kind === "league") decideSignup(detail.data.id, "approved");
                    if (detail.kind === "employment")
                      decideEmployment(detail.data.id, "approved");
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-[10px]"
                  onClick={() => {
                    if (detail.kind === "party") decideBooking(detail.data.id, "denied");
                    if (detail.kind === "league") decideSignup(detail.data.id, "denied");
                    if (detail.kind === "employment")
                      decideEmployment(detail.data.id, "denied");
                  }}
                >
                  Deny
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { PublicUser } from "@/lib/types";

type AppRow = {
  id: string;
  kind: "party" | "league" | "employment";
  title: string;
  detail: string;
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  subject: string;
  body: string;
  kind: string;
  createdAt: string;
  read?: boolean;
};

function statusLabel(status: string) {
  if (status === "pending") return "Under review";
  if (status === "approved") return "Approved";
  if (status === "denied") return "Denied";
  return status;
}

function statusClass(status: string) {
  if (status === "pending") return "text-amber-200";
  if (status === "approved") return "text-emerald-300";
  if (status === "denied") return "text-red-300";
  return "text-[var(--muted)]";
}

const APPROVED_NOTE =
  "If approved, it can take up to 7 days for us to get in contact with you.";

export default function ProfileClient() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [notifications, setNotifications] = useState<NoteRow[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    username: "",
    avatarUrl: "",
    currentPassword: "",
    newPassword: "",
  });

  const loadApplications = useCallback(async () => {
    const res = await fetch("/api/me/applications");
    if (!res.ok) return;
    const data = await res.json();
    setApplications(data.applications || []);
    setNotifications(data.notifications || []);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.user) {
          window.location.href = "/login?next=/profile";
          return;
        }
        setUser(d.user);
        setForm({
          firstName: d.user.firstName || "",
          lastName: d.user.lastName || "",
          email: d.user.email || "",
          phone: d.user.phone || "",
          birthDate: d.user.birthDate || "",
          username: d.user.username || "",
          avatarUrl: d.user.avatarUrl || "",
          currentPassword: "",
          newPassword: "",
        });
        await loadApplications();
      })
      .finally(() => setLoading(false));
  }, [loadApplications]);

  function onAvatar(file: File | null) {
    if (!file) return;
    if (file.size > 900_000) {
      setError("Please choose an image under 900KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, avatarUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok && !data.user) {
      setError(data.error || "Update failed");
      return;
    }
    if (data.user) {
      setUser(data.user);
      setForm({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        birthDate: data.user.birthDate || "",
        username: data.user.username || "",
        avatarUrl: data.user.avatarUrl || "",
        currentPassword: "",
        newPassword: "",
      });
    }
    if (data.durable) {
      setMessage("Profile updated and saved permanently.");
      return;
    }
    setError(
      data.help ||
        data.error ||
        "Saved only for this login. Connect Vercel Blob so it stays forever.",
    );
  }

  async function markAllNotificationsRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    await loadApplications();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loading) return <p className="mt-8 text-sm text-[var(--muted)]">Loading…</p>;
  if (!user) return null;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="panel p-5">
        <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden border border-[var(--line)] bg-[var(--blue-soft)]">
          {form.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.avatarUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-[var(--muted)]">No photo</span>
          )}
        </div>
        <p className="mt-4 text-center font-semibold text-[var(--ink)]">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-center text-xs tracking-wide text-[var(--muted)] uppercase">
          {user.roleName}
        </p>
        {user.permissions.includes("view_admin") ? (
          <Link href="/admin" className="btn btn-primary mt-4 w-full text-xs">
            Admin panel
          </Link>
        ) : null}
        <button type="button" className="btn btn-ghost mt-3 w-full text-xs" onClick={logout}>
          Sign out
        </button>
      </aside>

      <div className="grid gap-6">
        <section className="panel grid gap-4 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
                Applications
              </p>
              <h2 className="font-display mt-1 text-2xl text-[var(--ink)]">
                Party, league & employment
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link href="/book" className="btn btn-ghost">
                Party application
              </Link>
              <Link href="/leagues" className="btn btn-ghost">
                League application
              </Link>
              <Link href="/careers" className="btn btn-ghost">
                Employment
              </Link>
            </div>
          </div>
          {applications.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No applications yet. Submit a party, league, or employment
              application to see it here under review.
            </p>
          ) : (
            <ul className="grid gap-3">
              {applications.map((app) => (
                <li
                  key={`${app.kind}-${app.id}`}
                  className="border border-[var(--line)] bg-black/30 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                        {app.kind}
                      </p>
                      <p className="font-semibold text-[var(--ink)]">{app.title}</p>
                      {app.detail ? (
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {app.detail}
                        </p>
                      ) : null}
                      {app.adminNote ? (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Note: {app.adminNote}
                        </p>
                      ) : null}
                      {app.status === "pending" ? (
                        <p className="mt-2 text-xs text-amber-100/80">
                          {APPROVED_NOTE}
                        </p>
                      ) : null}
                      {app.status === "approved" ? (
                        <p className="mt-2 text-xs text-emerald-100/90">
                          {APPROVED_NOTE}
                        </p>
                      ) : null}
                    </div>
                    <p
                      className={`text-sm font-bold tracking-wide uppercase ${statusClass(app.status)}`}
                    >
                      {statusLabel(app.status)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel grid gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
                Notifications
              </p>
              <h2 className="font-display mt-1 text-2xl text-[var(--ink)]">
                Updates {unread ? `(${unread} new)` : ""}
              </h2>
            </div>
            {notifications.length ? (
              <button
                type="button"
                className="btn btn-ghost text-xs"
                onClick={() => void markAllNotificationsRead()}
              >
                Mark all read
              </button>
            ) : null}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              When an application is approved or denied, the update shows here.
            </p>
          ) : (
            <ul className="grid gap-3">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`border px-4 py-3 ${
                    n.read
                      ? "border-[var(--line)] bg-black/20"
                      : "border-[var(--blue)]/40 bg-[var(--blue-soft)]"
                  }`}
                >
                  <p className="font-semibold text-[var(--ink)]">{n.subject}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted)]">
                    {n.body}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={onSubmit} className="panel grid gap-4 p-6">
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
            Account details
          </p>
          {error ? (
            <div className="border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <p className="font-semibold text-amber-50">
                Profile is not saving permanently yet
              </p>
              <p className="mt-2 opacity-95">{error}</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-amber-50/95">
                <li>
                  Download the latest FULL zip from GitHub Releases
                </li>
                <li>Upload it into your existing Vercel project</li>
                <li>Storage → Blob → Create/Connect → Redeploy</li>
                <li>
                  Open <Link href="/admin" className="underline">Admin</Link> →
                  Test save now → PASS
                </li>
              </ol>
            </div>
          ) : null}
          <div className="field">
            <label htmlFor="avatar">Profile picture</label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => onAvatar(e.target.files?.[0] || null)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="birthDate">Birth date</label>
              <input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </div>
          </div>
          {message ? (
            <p className="text-sm font-semibold text-emerald-300">{message}</p>
          ) : null}
          <button type="submit" className="btn btn-primary w-fit">
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

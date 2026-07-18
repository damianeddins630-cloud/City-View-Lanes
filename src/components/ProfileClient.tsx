"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { PublicUser } from "@/lib/types";

export default function ProfileClient() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
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
      })
      .finally(() => setLoading(false));
  }, []);

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
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
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
    setMessage(
      data.persistence === "memory"
        ? "Saved for now — add BLOB_READ_WRITE_TOKEN in Vercel so it stays after redeploy."
        : "Profile updated and saved.",
    );
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loading) return <p className="mt-8 text-sm text-[var(--muted)]">Loading…</p>;
  if (!user) return null;

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
        <p className="mt-4 text-center font-semibold text-[var(--navy)]">
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

      <form onSubmit={onSubmit} className="panel grid gap-4 p-6">
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
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        {message ? (
          <p className="text-sm font-semibold text-[var(--blue)]">{message}</p>
        ) : null}
        <button type="submit" className="btn btn-primary w-fit">
          Save changes
        </button>
      </form>
    </div>
  );
}

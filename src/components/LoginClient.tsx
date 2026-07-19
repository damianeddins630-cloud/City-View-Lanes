"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [signIn, setSignIn] = useState({ identifier: "", password: "" });
  const [create, setCreate] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  async function submitSignIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signIn),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Sign in failed");
      return;
    }
    window.location.href = nextPath;
  }

  async function submitCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(create),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create account");
      return;
    }
    window.location.href = nextPath;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-[min(480px,calc(100%-1.5rem))] flex-col justify-center py-16">
      <h1 className="font-display text-center text-5xl tracking-[0.06em] text-white">
        CityView Lanes
      </h1>

      <div className="mt-8 flex border border-[var(--line)] bg-white/35">
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-bold tracking-wide uppercase ${
            mode === "signin"
              ? "bg-[var(--blue)] text-white"
              : "text-[var(--muted)]"
          }`}
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-bold tracking-wide uppercase ${
            mode === "create"
              ? "bg-[var(--blue)] text-white"
              : "text-[var(--muted)]"
          }`}
          onClick={() => setMode("create")}
        >
          Create account
        </button>
      </div>

      {mode === "signin" ? (
        <form onSubmit={submitSignIn} className="mt-6 grid gap-4 border border-[var(--line)] bg-white/35 p-6">
          <div className="field">
            <label htmlFor="identifier">Username or email *</label>
            <input
              id="identifier"
              required
              value={signIn.identifier}
              onChange={(e) =>
                setSignIn({ ...signIn, identifier: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              required
              value={signIn.password}
              onChange={(e) =>
                setSignIn({ ...signIn, password: e.target.value })
              }
            />
          </div>
          <p className="text-xs text-[var(--muted)]">Forgot password?</p>
          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitCreate} className="mt-6 grid gap-4 border border-[var(--line)] bg-white/35 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                value={create.firstName}
                onChange={(e) =>
                  setCreate({ ...create, firstName: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                value={create.lastName}
                onChange={(e) =>
                  setCreate({ ...create, lastName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              required
              value={create.username}
              onChange={(e) =>
                setCreate({ ...create, username: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              required
              value={create.email}
              onChange={(e) => setCreate({ ...create, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              value={create.phone}
              onChange={(e) => setCreate({ ...create, phone: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="newPassword">Password *</label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              value={create.password}
              onChange={(e) =>
                setCreate({ ...create, password: e.target.value })
              }
            />
          </div>
          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      )}

      <Link
        href="/"
        className="mt-6 text-center text-sm font-semibold text-[var(--blue)]"
      >
        ← Back to CityView Lanes
      </Link>
    </div>
  );
}

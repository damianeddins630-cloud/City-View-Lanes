"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { PublicUser } from "@/lib/types";

export default function CareersClient() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    applicationDate: today,
    firstName: "",
    lastName: "",
    middleName: "",
    street: "",
    apt: "",
    city: "",
    state: "TX",
    zip: "",
    altStreet: "",
    altApt: "",
    altCity: "",
    altState: "",
    altZip: "",
    homePhone: "",
    mobilePhone: "",
    email: "",
    howHeard: "",
    position: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const u = d.user as PublicUser | null;
        setUser(u);
        if (u) {
          setForm((f) => ({
            ...f,
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            mobilePhone: u.phone || "",
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/employment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Could not submit application");
      if (res.status === 401) window.location.href = "/login?next=/careers";
      return;
    }
    setMessage(
      data.message ||
        "Application submitted and under review. Check your Profile.",
    );
  }

  if (loading) {
    return <p className="mt-8 text-sm text-[var(--muted)]">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="mt-8 border border-[var(--line)] bg-black/40 p-6">
        <p className="text-[var(--ink)]">
          Please sign in or create an account to submit an employment
          application.
        </p>
        <Link href="/login?next=/careers" className="btn btn-primary mt-5">
          Sign in to continue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel mt-8 grid gap-5 p-6">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-[var(--blue)] uppercase">
          Personal Information
        </p>
      </div>

      <div className="field max-w-xs">
        <label htmlFor="applicationDate">Date of Application *</label>
        <input
          id="applicationDate"
          type="date"
          required
          value={form.applicationDate}
          onChange={(e) => setForm({ ...form, applicationDate: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="field">
          <label htmlFor="firstName">First name *</label>
          <input
            id="firstName"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="middleName">Middle name</label>
          <input
            id="middleName"
            value={form.middleName}
            onChange={(e) => setForm({ ...form, middleName: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="lastName">Last name *</label>
          <input
            id="lastName"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-white/70 uppercase">
          Address
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field sm:col-span-2">
            <label htmlFor="street">Street *</label>
            <input
              id="street"
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="apt">Apt</label>
            <input
              id="apt"
              value={form.apt}
              onChange={(e) => setForm({ ...form, apt: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="state">State *</label>
            <input
              id="state"
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="zip">ZIP *</label>
            <input
              id="zip"
              required
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-white/70 uppercase">
          Alternate Address
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field sm:col-span-2">
            <label htmlFor="altStreet">Street</label>
            <input
              id="altStreet"
              value={form.altStreet}
              onChange={(e) => setForm({ ...form, altStreet: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="altApt">Apt</label>
            <input
              id="altApt"
              value={form.altApt}
              onChange={(e) => setForm({ ...form, altApt: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="altCity">City</label>
            <input
              id="altCity"
              value={form.altCity}
              onChange={(e) => setForm({ ...form, altCity: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="altState">State</label>
            <input
              id="altState"
              value={form.altState}
              onChange={(e) => setForm({ ...form, altState: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="altZip">ZIP</label>
            <input
              id="altZip"
              value={form.altZip}
              onChange={(e) => setForm({ ...form, altZip: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-white/70 uppercase">
          Contact Information
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="homePhone">Home phone</label>
            <input
              id="homePhone"
              value={form.homePhone}
              onChange={(e) => setForm({ ...form, homePhone: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="mobilePhone">Mobile phone *</label>
            <input
              id="mobilePhone"
              required
              value={form.mobilePhone}
              onChange={(e) => setForm({ ...form, mobilePhone: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="field">
        <label htmlFor="howHeard">How did you learn about our company?</label>
        <input
          id="howHeard"
          value={form.howHeard}
          onChange={(e) => setForm({ ...form, howHeard: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="position">Position applying for *</label>
        <input
          id="position"
          required
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          placeholder="e.g. Front desk, Mechanic, Party host"
        />
      </div>

      {error ? (
        <p className="text-sm font-semibold text-red-400">{error}</p>
      ) : null}
      {message ? (
        <div className="border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {message}{" "}
          <Link href="/profile" className="underline">
            View Profile
          </Link>
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary w-fit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

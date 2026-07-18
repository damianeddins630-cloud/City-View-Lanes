"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { PublicUser } from "@/lib/types";

export default function BookClient() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    eventDate: "",
    eventTime: "",
    partySize: "10",
    eventType: "Birthday",
    notes: "",
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
            phone: u.phone || "",
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
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, partySize: Number(form.partySize) }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Booking failed");
      if (res.status === 401) window.location.href = "/login?next=/book";
      return;
    }
    setMessage(
      data.message ||
        "We will be with you shortly. A confirmation email has been queued.",
    );
  }

  if (loading) {
    return <p className="mt-8 text-sm text-[var(--muted)]">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="mt-8 border border-[var(--line)] bg-white p-6">
        <p className="text-[var(--ink)]">
          Please sign in or create an account to book a party or join a league.
        </p>
        <Link href="/login?next=/book" className="btn btn-primary mt-5">
          Sign in to continue
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-3xl gap-4 panel p-6">
      <div className="grid gap-4 sm:grid-cols-2">
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
          <label htmlFor="lastName">Last name *</label>
          <input
            id="lastName"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="field">
          <label htmlFor="phone">Phone number *</label>
          <input
            id="phone"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="field">
          <label htmlFor="eventDate">Date *</label>
          <input
            id="eventDate"
            type="date"
            required
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="eventTime">Time *</label>
          <input
            id="eventTime"
            type="time"
            required
            value={form.eventTime}
            onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="partySize">How many people *</label>
          <input
            id="partySize"
            type="number"
            min={1}
            required
            value={form.partySize}
            onChange={(e) => setForm({ ...form, partySize: e.target.value })}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="eventType">Event type</label>
        <select
          id="eventType"
          value={form.eventType}
          onChange={(e) => setForm({ ...form, eventType: e.target.value })}
        >
          <option>Birthday</option>
          <option>Corporate</option>
          <option>Fundraiser</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Food preferences, bumper lanes, cake table, etc."
        />
      </div>

      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
      {message ? (
        <p className="text-sm font-semibold text-[var(--blue)]">{message}</p>
      ) : null}

      <button type="submit" className="btn btn-primary w-fit" disabled={submitting}>
        {submitting ? "Sending…" : "Submit booking request"}
      </button>
    </form>
  );
}

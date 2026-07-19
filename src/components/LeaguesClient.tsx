"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import type { League, PublicUser } from "@/lib/types";

export default function LeaguesClient({
  initialLeagues,
}: {
  initialLeagues: League[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("waitlist");
  const [form, setForm] = useState({
    teamName: "",
    firstName: "",
    lastName: "",
    street: "",
    apt: "",
    city: "",
    state: "TX",
    zip: "",
    phone: "",
    email: "",
    fullTeam: "",
    teamCount: "",
    preferredDay: "Monday",
    preferredType: "Adult",
    note: "",
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
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (searchParams.get("join") === "1") {
      void startJoin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, searchParams]);

  const leagues = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialLeagues;
    return initialLeagues.filter((l) =>
      [l.name, l.day, l.type, l.time, l.teamSize]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [initialLeagues, query]);

  function openApplication(leagueId: string) {
    setError("");
    setMessage("");
    if (!authChecked) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/leagues?join=1")}`);
      return;
    }
    setSelectedLeagueId(leagueId);
    setShowForm(true);
    setMessage(
      leagueId === "waitlist"
        ? "Fill out the league application below."
        : "Complete your name and address to apply for this league.",
    );
  }

  async function startJoin() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/leagues?join=1")}`);
      return;
    }
    if (initialLeagues.length === 0) {
      openApplication("waitlist");
      return;
    }
    setShowForm(false);
    setMessage("Pick a league below and click Apply.");
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitApplication(e: FormEvent) {
    e.preventDefault();
    setBusyId(selectedLeagueId);
    setError("");
    setMessage("");

    const res = await fetch("/api/leagues/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leagueId: selectedLeagueId,
        teamName: form.teamName,
        firstName: form.firstName,
        lastName: form.lastName,
        applicantName: `${form.firstName} ${form.lastName}`.trim(),
        street: form.street,
        apt: form.apt,
        city: form.city,
        state: form.state,
        zip: form.zip,
        phone: form.phone,
        email: form.email,
        fullTeam: form.fullTeam,
        teamCount: form.teamCount,
        preferredDay: form.preferredDay,
        preferredType: form.preferredType,
        note: form.note,
      }),
    });
    const data = await res.json();
    setBusyId(null);

    if (!res.ok) {
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/leagues?join=1")}`);
        return;
      }
      setError(data.error || "Could not submit league application.");
      return;
    }

    setMessage(
      data.message ||
        "Application submitted — under review on your Profile.",
    );
    setShowForm(false);
  }

  const selectedLeague =
    selectedLeagueId === "waitlist"
      ? null
      : initialLeagues.find((l) => l.id === selectedLeagueId);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={() => void startJoin()}>
          League application
        </button>
        <a href={`tel:${SITE.phoneTel}`} className="btn btn-ghost">
          Call {SITE.phoneDisplay}
        </a>
      </div>

      {message ? (
        <p className="mt-4 text-sm font-semibold text-[var(--blue)]">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>
      ) : null}

      {showForm ? (
        <form onSubmit={submitApplication} className="panel mt-6 grid max-w-2xl gap-4 p-5">
          <h2 className="font-display text-2xl text-white">League application</h2>
          <p className="text-sm text-[var(--muted)]">
            {selectedLeague
              ? `Applying for: ${selectedLeague.name} (${selectedLeague.day} ${selectedLeague.time})`
              : "General league interest / waitlist"}
            . Track status on your Profile. If approved, it can take up to 7 days
            for us to get in contact with you.
          </p>

          <div className="field">
            <label htmlFor="teamName">Name (team / league name) *</label>
            <input
              id="teamName"
              required
              value={form.teamName}
              onChange={(e) => setForm({ ...form, teamName: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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

          <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">
            Address
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="phone">Phone number *</label>
              <input
                id="phone"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="email">E-mail *</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="fullTeam">Do you have a full team? *</label>
              <select
                id="fullTeam"
                required
                value={form.fullTeam}
                onChange={(e) => setForm({ ...form, fullTeam: e.target.value })}
              >
                <option value="">Select…</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {form.fullTeam === "No" ? (
              <div className="field">
                <label htmlFor="teamCount">If not, how many people do you have? *</label>
                <input
                  id="teamCount"
                  required
                  type="number"
                  min={1}
                  value={form.teamCount}
                  onChange={(e) => setForm({ ...form, teamCount: e.target.value })}
                />
              </div>
            ) : null}
          </div>

          {selectedLeagueId === "waitlist" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="preferredDay">Preferred day</label>
                <select
                  id="preferredDay"
                  value={form.preferredDay}
                  onChange={(e) =>
                    setForm({ ...form, preferredDay: e.target.value })
                  }
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                    (d) => (
                      <option key={d}>{d}</option>
                    ),
                  )}
                </select>
              </div>
              <div className="field">
                <label htmlFor="preferredType">League type</label>
                <select
                  id="preferredType"
                  value={form.preferredType}
                  onChange={(e) =>
                    setForm({ ...form, preferredType: e.target.value })
                  }
                >
                  {["Adult", "Senior", "Youth", "IGBO", "Mixed", "Other"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="note">Notes</label>
            <textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Experience, friends joining, etc."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-fit"
            disabled={busyId === selectedLeagueId}
          >
            {busyId === selectedLeagueId ? "Submitting…" : "Submit application"}
          </button>
        </form>
      ) : null}

      <div ref={listRef} className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leagues, days, or types…"
            className="min-h-11 w-full border border-[var(--line)] bg-black/40 px-3 sm:max-w-md"
          />
          <p className="text-sm font-semibold text-[var(--muted)]">
            {leagues.length} league{leagues.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="panel mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--navy)] text-xs tracking-[0.08em] text-white uppercase">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">League</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">Meeting</th>
                <th className="px-4 py-3">Apply</th>
              </tr>
            </thead>
            <tbody>
              {leagues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[var(--muted)]">
                    No leagues listed yet. Use <strong>League application</strong>{" "}
                    above to send interest (login required).
                  </td>
                </tr>
              ) : (
                leagues.map((league, index) => (
                  <tr
                    key={league.id}
                    className={`border-t border-[var(--line)] ${
                      index % 2 === 0 ? "bg-black/20" : "bg-[var(--blue)]/10"
                    }`}
                  >
                    <td className="px-4 py-3">{league.day}</td>
                    <td className="px-4 py-3">{league.time}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {league.name}
                    </td>
                    <td className="px-4 py-3">{league.type}</td>
                    <td className="px-4 py-3">{league.teamSize}</td>
                    <td className="px-4 py-3">{league.startDate}</td>
                    <td className="px-4 py-3">{league.meetingInfo}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="btn btn-primary text-[10px]"
                        onClick={() => openApplication(league.id)}
                      >
                        Apply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

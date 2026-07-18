"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
  const [showInterest, setShowInterest] = useState(false);
  const [interest, setInterest] = useState({
    preferredDay: "Monday",
    preferredType: "Adult",
    note: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
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

  async function startJoin() {
    setError("");
    setMessage("");

    if (!authChecked) return;

    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/leagues?join=1")}`);
      return;
    }

    if (initialLeagues.length === 0) {
      setShowInterest(true);
      setMessage("No leagues are posted yet — send your interest and we’ll place you.");
      return;
    }

    setShowInterest(false);
    setMessage("Pick a league below and hit Join.");
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function joinLeague(leagueId: string, extra?: Record<string, string>) {
    setBusyId(leagueId);
    setError("");
    setMessage("");

    const res = await fetch("/api/leagues/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leagueId, ...extra }),
    });
    const data = await res.json();
    setBusyId(null);

    if (!res.ok) {
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/leagues?join=1")}`);
        return;
      }
      setError(data.error || "Could not join league.");
      return;
    }

    setMessage(data.message || "Signup submitted — we will be with you shortly.");
    setShowInterest(false);
  }

  async function submitInterest(e: FormEvent) {
    e.preventDefault();
    await joinLeague("waitlist", interest);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={() => void startJoin()}>
          Join a League
        </button>
        <a href="tel:8173460333" className="btn btn-ghost">
          Call (817) 346-0333
        </a>
      </div>

      {message ? (
        <p className="mt-4 text-sm font-semibold text-[var(--blue)]">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>
      ) : null}

      {showInterest ? (
        <form onSubmit={submitInterest} className="panel mt-6 grid max-w-xl gap-3 p-5">
          <h2 className="font-display text-2xl text-[var(--navy)]">
            League interest signup
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Signed in as <strong>{user?.email}</strong>. Tell us what you’re looking
            for and we’ll follow up.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="preferredDay">Preferred day</label>
              <select
                id="preferredDay"
                value={interest.preferredDay}
                onChange={(e) =>
                  setInterest({ ...interest, preferredDay: e.target.value })
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
                value={interest.preferredType}
                onChange={(e) =>
                  setInterest({ ...interest, preferredType: e.target.value })
                }
              >
                {["Adult", "Senior", "Youth", "IGBO", "Mixed", "Other"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="note">Notes</label>
            <textarea
              id="note"
              value={interest.note}
              onChange={(e) => setInterest({ ...interest, note: e.target.value })}
              placeholder="Team size, experience level, friends joining, etc."
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-fit"
            disabled={busyId === "waitlist"}
          >
            {busyId === "waitlist" ? "Submitting…" : "Submit join request"}
          </button>
        </form>
      ) : null}

      <div ref={listRef} className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leagues, days, or types…"
            className="min-h-11 w-full border border-[var(--line)] bg-white px-3 sm:max-w-md"
          />
          <p className="text-sm font-semibold text-[var(--muted)]">
            {leagues.length} league{leagues.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="panel mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--blue-soft)] text-xs tracking-[0.08em] text-[var(--navy)] uppercase">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">League</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">Meeting</th>
                <th className="px-4 py-3">Join</th>
              </tr>
            </thead>
            <tbody>
              {leagues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[var(--muted)]">
                    No leagues listed yet. Use <strong>Join a League</strong> above
                    to send an interest request (login required).
                  </td>
                </tr>
              ) : (
                leagues.map((league) => (
                  <tr key={league.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3">{league.day}</td>
                    <td className="px-4 py-3">{league.time}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--navy)]">
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
                        disabled={busyId === league.id}
                        onClick={() => {
                          if (!user) {
                            router.push(
                              `/login?next=${encodeURIComponent("/leagues?join=1")}`,
                            );
                            return;
                          }
                          void joinLeague(league.id);
                        }}
                      >
                        {busyId === league.id ? "…" : "Join"}
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

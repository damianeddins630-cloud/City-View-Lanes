"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { League } from "@/lib/types";

export default function LeaguesClient({
  initialLeagues,
}: {
  initialLeagues: League[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const leagues = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialLeagues;
    return initialLeagues.filter((l) =>
      [l.name, l.day, l.type, l.time, l.teamSize].join(" ").toLowerCase().includes(q),
    );
  }, [initialLeagues, query]);

  async function joinLeague(leagueId: string) {
    setBusyId(leagueId);
    setMessage("");
    const res = await fetch("/api/leagues/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leagueId }),
    });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setMessage(data.error || "Could not join league. Sign in first?");
      if (res.status === 401) {
        router.push("/login?next=/leagues");
      }
      return;
    }
    setMessage("Signup submitted — we'll review and email you shortly.");
  }

  return (
    <div className="mt-10">
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

      {message ? (
        <p className="mt-4 text-sm font-semibold text-[var(--blue)]">{message}</p>
      ) : null}

      <div className="mt-5 overflow-x-auto border border-[var(--line)] bg-white">
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
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {leagues.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[var(--muted)]">
                  No leagues listed yet. Check back soon or call the center.
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
                      className="btn btn-ghost text-[10px]"
                      disabled={busyId === league.id}
                      onClick={() => joinLeague(league.id)}
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
  );
}

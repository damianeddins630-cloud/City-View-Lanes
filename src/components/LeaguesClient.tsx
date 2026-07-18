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
  const formRef = useRef<HTMLFormElement | null>(null);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reg, setReg] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    leagueName: "",
    fullTeam: "yes",
    peopleCount: "",
    note: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user || null);
        if (d.user) {
          setReg((r) => ({
            ...r,
            name: `${d.user.firstName || ""} ${d.user.lastName || ""}`.trim(),
            phone: d.user.phone || "",
            email: d.user.email || "",
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
      [l.name, l.day, l.type, l.time, l.teamSize, l.startDate, l.meetingInfo]
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
      setMessage("Pick your league details in the form below and submit.");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setMessage("Pick a league in the menu, or fill out the registration form.");
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
  }

  async function submitRegistration(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/leagues?join=1")}`);
      return;
    }

    const matched = initialLeagues.find(
      (l) => l.name.toLowerCase() === reg.leagueName.trim().toLowerCase(),
    );

    const note = [
      `Name: ${reg.name}`,
      `Address: ${reg.address}`,
      `Phone: ${reg.phone}`,
      `Email: ${reg.email}`,
      `League: ${reg.leagueName}`,
      `Full team: ${reg.fullTeam}`,
      reg.fullTeam === "no" && reg.peopleCount
        ? `People on team: ${reg.peopleCount}`
        : "",
      reg.note ? `Notes: ${reg.note}` : "",
    ]
      .filter(Boolean)
      .join(" · ");

    await joinLeague(matched?.id || "waitlist", {
      note,
      preferredDay: matched?.day || "",
      preferredType: matched?.type || "",
    });
  }

  return (
    <div className="league-menu-body">
      <div className="flex flex-wrap gap-3 px-4 pt-6 sm:px-6">
        <button type="button" className="btn btn-hero-primary" onClick={() => void startJoin()}>
          Join a League
        </button>
        <a href={`tel:${SITE.leaguePhoneTel}`} className="btn btn-hero-light">
          Call {SITE.leaguePhoneDisplay}
        </a>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search day, league, type…"
          className="min-h-11 min-w-[200px] flex-1 border border-white/20 bg-white/10 px-3 text-white placeholder:text-white/50 sm:max-w-xs"
        />
      </div>

      {message ? (
        <p className="mt-4 px-4 text-sm font-semibold text-[var(--accent-warm)] sm:px-6">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 px-4 text-sm font-semibold text-red-300 sm:px-6">{error}</p>
      ) : null}

      <div ref={listRef} className="mt-6 overflow-x-auto px-2 sm:px-4">
        <table className="league-menu-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>League Name</th>
              <th>Type</th>
              <th># / Team</th>
              <th>Start Date</th>
              <th>Meeting</th>
              <th>Join</th>
            </tr>
          </thead>
          <tbody>
            {leagues.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-cell">
                  League rows will show here. Admin can paste the full Fall menu
                  in <strong>Admin → League Manager</strong>.
                </td>
              </tr>
            ) : (
              leagues.map((league) => (
                <tr key={league.id}>
                  <td>{league.day}</td>
                  <td>{league.time}</td>
                  <td className="league-name-cell">{league.name}</td>
                  <td>{league.type}</td>
                  <td>{league.teamSize}</td>
                  <td>{league.startDate}</td>
                  <td>{league.meetingInfo}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-hero-primary !min-h-8 !px-3 !text-[10px]"
                      disabled={busyId === league.id}
                      onClick={() => {
                        if (!user) {
                          router.push(
                            `/login?next=${encodeURIComponent("/leagues?join=1")}`,
                          );
                          return;
                        }
                        setReg((r) => ({ ...r, leagueName: league.name }));
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

      <div className="league-callout">
        *** If you have questions regarding the Fall Leagues please call the
        center ★{" "}
        <a href={`tel:${SITE.leaguePhoneTel}`} className="league-callout-phone">
          CALL {SITE.leaguePhoneDisplay}
        </a>
      </div>

      <form ref={formRef} onSubmit={submitRegistration} className="league-reg-form">
        <div className="league-reg-head">
          <h2 className="font-display text-3xl tracking-[0.06em] text-white">
            League registration
          </h2>
          <p className="mt-1 text-sm text-white/75">
            Same info as the paper menu — login required to submit.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="field league-field">
            <label htmlFor="reg-name">Name</label>
            <input
              id="reg-name"
              required
              value={reg.name}
              onChange={(e) => setReg({ ...reg, name: e.target.value })}
            />
          </div>
          <div className="field league-field">
            <label htmlFor="reg-league">Lg. Name</label>
            <input
              id="reg-league"
              required
              list="league-names"
              value={reg.leagueName}
              onChange={(e) => setReg({ ...reg, leagueName: e.target.value })}
              placeholder="Type or pick a league"
            />
            <datalist id="league-names">
              {initialLeagues.map((l) => (
                <option key={l.id} value={l.name} />
              ))}
            </datalist>
          </div>
          <div className="field league-field md:col-span-2">
            <label htmlFor="reg-address">Address</label>
            <input
              id="reg-address"
              value={reg.address}
              onChange={(e) => setReg({ ...reg, address: e.target.value })}
            />
          </div>
          <div className="field league-field">
            <label htmlFor="reg-phone">Phone #</label>
            <input
              id="reg-phone"
              required
              value={reg.phone}
              onChange={(e) => setReg({ ...reg, phone: e.target.value })}
            />
          </div>
          <div className="field league-field">
            <label htmlFor="reg-email">E-mail</label>
            <input
              id="reg-email"
              type="email"
              required
              value={reg.email}
              onChange={(e) => setReg({ ...reg, email: e.target.value })}
            />
          </div>
          <div className="field league-field">
            <label htmlFor="reg-full">Do you have a full team?</label>
            <select
              id="reg-full"
              value={reg.fullTeam}
              onChange={(e) => setReg({ ...reg, fullTeam: e.target.value })}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="field league-field">
            <label htmlFor="reg-count">If not, how many people?</label>
            <input
              id="reg-count"
              value={reg.peopleCount}
              onChange={(e) => setReg({ ...reg, peopleCount: e.target.value })}
              disabled={reg.fullTeam === "yes"}
            />
          </div>
          <div className="field league-field md:col-span-2">
            <label htmlFor="reg-note">Notes</label>
            <textarea
              id="reg-note"
              value={reg.note}
              onChange={(e) => setReg({ ...reg, note: e.target.value })}
              placeholder="Friends joining, experience level, etc."
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-hero-primary mt-5"
          disabled={busyId === "waitlist" || Boolean(busyId && busyId !== "waitlist")}
        >
          {busyId ? "Submitting…" : "Submit registration"}
        </button>
      </form>
    </div>
  );
}

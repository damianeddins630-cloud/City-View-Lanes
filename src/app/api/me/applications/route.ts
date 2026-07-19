import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readStore } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Member applications + notifications for the Profile page. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const store = await readStore();

  const partyApplications = store.bookings
    .filter((b) => b.userId === user.id)
    .map((b) => ({
      id: b.id,
      kind: "party" as const,
      title: `${b.eventType} party`,
      detail: `${b.eventDate} ${b.eventTime} · party of ${b.partySize}`,
      status: b.status,
      adminNote: b.adminNote || "",
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

  const leagueApplications = store.leagueSignups
    .filter((s) => s.userId === user.id)
    .map((s) => {
      const league = store.leagues.find((l) => l.id === s.leagueId);
      const title =
        s.leagueId === "waitlist"
          ? "League interest / waitlist"
          : league?.name || "League application";
      return {
        id: s.id,
        kind: "league" as const,
        title,
        detail: [league?.day, league?.time, s.note].filter(Boolean).join(" · "),
        status: s.status,
        adminNote: s.adminNote || "",
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

  const employmentApplications = (store.employmentApplications || [])
    .filter((a) => a.userId === user.id)
    .map((a) => ({
      id: a.id,
      kind: "employment" as const,
      title: a.position || "Employment application",
      detail: `Applied ${a.applicationDate}`,
      status: a.status,
      adminNote: a.adminNote || "",
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

  const notifications = (store.notifications || [])
    .filter((n) => n.userId === user.id)
    .slice(0, 40);

  return NextResponse.json({
    applications: [
      ...partyApplications,
      ...leagueApplications,
      ...employmentApplications,
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    notifications,
  });
}

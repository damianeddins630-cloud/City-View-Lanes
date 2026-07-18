import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { leagueDecisionEmail, sendEmail } from "@/lib/email";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_league_signups")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  const signups = store.leagueSignups.map((s) => {
    const member = store.users.find((u) => u.id === s.userId);
    const league = store.leagues.find((l) => l.id === s.leagueId);
    const isWaitlist = s.leagueId === "waitlist";
    return {
      ...s,
      username: member?.username || "",
      memberName: member
        ? `${member.firstName} ${member.lastName}`.trim()
        : "",
      memberEmail: member?.email || "",
      leagueName: isWaitlist
        ? "General interest / waitlist"
        : league?.name || "Unknown league",
      leagueDay: isWaitlist ? "TBD" : league?.day || "",
      leagueTime: isWaitlist ? "TBD" : league?.time || "",
    };
  });
  return NextResponse.json({ signups });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_league_signups")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "");
    const status = body.status as "approved" | "denied";
    const adminNote = String(body.adminNote || "").trim();

    if (!id || !["approved", "denied"].includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    let email = "";
    let name = "";
    let userId = "";
    let leagueName = "";

    await updateStore((s) => {
      const signup = s.leagueSignups.find((x) => x.id === id);
      if (!signup) throw new Error("Signup not found");
      signup.status = status;
      signup.adminNote = adminNote;
      signup.updatedAt = new Date().toISOString();

      const member = s.users.find((u) => u.id === signup.userId);
      const league = s.leagues.find((l) => l.id === signup.leagueId);
      email = member?.email || "";
      name = member?.firstName || member?.username || "Bowler";
      userId = signup.userId;
      leagueName =
        signup.leagueId === "waitlist"
          ? "General interest / waitlist"
          : league?.name || "your league";
    });

    if (email) {
      const mail = leagueDecisionEmail(name, leagueName, status, adminNote);
      await sendEmail({
        userId,
        email,
        subject: mail.subject,
        body: mail.body,
        kind: `league_${status}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

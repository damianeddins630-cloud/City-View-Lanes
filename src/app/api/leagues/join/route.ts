import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PersistenceError, readStore, updateStore } from "@/lib/db";
import { leagueReceivedEmail, sendEmail } from "@/lib/email";
import { makeId } from "@/lib/ids";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to join a league." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const leagueId = String(body.leagueId || "waitlist").trim() || "waitlist";
    const note = String(body.note || "").trim();
    const preferredDay = String(body.preferredDay || "").trim();
    const preferredType = String(body.preferredType || "").trim();
    const teamName = String(body.teamName || body.name || "").trim();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const applicantName =
      String(body.applicantName || "").trim() ||
      `${firstName} ${lastName}`.trim();
    const street = String(body.street || "").trim();
    const apt = String(body.apt || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const zip = String(body.zip || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || user.email || "").trim().toLowerCase();
    const fullTeam = String(body.fullTeam || "").trim();
    const teamCount = String(body.teamCount || "").trim();

    if (
      !teamName ||
      !firstName ||
      !lastName ||
      !street ||
      !city ||
      !state ||
      !zip ||
      !phone ||
      !email ||
      !fullTeam
    ) {
      return NextResponse.json(
        {
          error:
            "Please fill in name, address, phone, email, first/last name, and full-team answer.",
        },
        { status: 400 },
      );
    }

    if (fullTeam === "No" && !teamCount) {
      return NextResponse.json(
        { error: "Please tell us how many people you have if you do not have a full team." },
        { status: 400 },
      );
    }

    const store = await readStore();

    if (leagueId !== "waitlist") {
      const league = store.leagues.find((l) => l.id === leagueId);
      if (!league) {
        return NextResponse.json({ error: "League not found." }, { status: 404 });
      }
    }

    const existing = store.leagueSignups.find(
      (s) =>
        s.userId === user.id &&
        s.leagueId === leagueId &&
        s.status !== "denied",
    );
    if (existing) {
      return NextResponse.json(
        {
          error:
            leagueId === "waitlist"
              ? "You already have a pending league interest request."
              : "You already have an application for this league.",
        },
        { status: 400 },
      );
    }

    const combinedNote = [
      note,
      preferredDay ? `Preferred day: ${preferredDay}` : "",
      preferredType ? `Preferred type: ${preferredType}` : "",
      `Full team: ${fullTeam}`,
      fullTeam === "No" ? `People on roster: ${teamCount}` : "",
    ]
      .filter(Boolean)
      .join(" · ");

    const now = new Date().toISOString();
    const signup = {
      id: makeId("ls"),
      userId: user.id,
      leagueId,
      status: "pending" as const,
      note: combinedNote,
      teamName,
      firstName,
      lastName,
      applicantName,
      street,
      apt,
      city,
      state,
      zip,
      phone,
      email,
      fullTeam,
      teamCount: fullTeam === "Yes" ? "" : teamCount,
      createdAt: now,
      updatedAt: now,
    };

    await updateStore((s) => {
      s.leagueSignups.unshift(signup);
    });

    const leagueName =
      leagueId === "waitlist"
        ? "Fall league interest / waitlist"
        : store.leagues.find((l) => l.id === leagueId)?.name || "League";

    const mail = leagueReceivedEmail(firstName || user.username, leagueName);
    await sendEmail({
      userId: user.id,
      email,
      subject: mail.subject,
      body: mail.body,
      kind: "league_signup_received",
    });

    return NextResponse.json({
      signup,
      message:
        "League application submitted — under review on your Profile. If approved, it can take up to 7 days for us to get in contact with you.",
    });
  } catch (error) {
    if (error instanceof PersistenceError) {
      return NextResponse.json({ error: error.message, durable: false }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Could not submit league application." },
      { status: 500 },
    );
  }
}

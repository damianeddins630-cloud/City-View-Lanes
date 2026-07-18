import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PersistenceError, readStore, updateStore } from "@/lib/db";
import { sendEmail } from "@/lib/email";
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
              : "You already have a signup for this league.",
        },
        { status: 400 },
      );
    }

    const combinedNote = [
      note,
      preferredDay ? `Preferred day: ${preferredDay}` : "",
      preferredType ? `Preferred type: ${preferredType}` : "",
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

    await sendEmail({
      userId: user.id,
      email: user.email,
      subject: "CityView Lanes — league signup received",
      body: `Hi ${user.firstName || user.username},\n\nWe received your request for: ${leagueName}.\n\nWe will be with you shortly to confirm details.\n\n— CityView Lanes\n(817) 346-0333`,
      kind: "league_signup_received",
    });

    return NextResponse.json({
      signup,
      message: "Signup submitted — we will be with you shortly.",
    });
  } catch (error) {
    if (error instanceof PersistenceError) {
      return NextResponse.json({ error: error.message, durable: false }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Could not submit league signup." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { makeId } from "@/lib/ids";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to join a league." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const leagueId = String(body.leagueId || "");
  const note = String(body.note || "").trim();

  const store = await readStore();
  const league = store.leagues.find((l) => l.id === leagueId);
  if (!league) {
    return NextResponse.json({ error: "League not found." }, { status: 404 });
  }

  const existing = store.leagueSignups.find(
    (s) =>
      s.userId === user.id &&
      s.leagueId === leagueId &&
      s.status !== "denied",
  );
  if (existing) {
    return NextResponse.json(
      { error: "You already have a signup for this league." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const signup = {
    id: makeId("ls"),
    userId: user.id,
    leagueId,
    status: "pending" as const,
    note,
    createdAt: now,
    updatedAt: now,
  };

  await updateStore((s) => {
    s.leagueSignups.unshift(signup);
  });

  return NextResponse.json({ signup });
}

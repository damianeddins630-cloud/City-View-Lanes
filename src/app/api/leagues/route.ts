import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { makeId } from "@/lib/ids";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ leagues: store.leagues });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_leagues")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const league = {
      id: makeId("lg"),
      day: String(body.day || "").trim(),
      time: String(body.time || "").trim(),
      name: String(body.name || "").trim(),
      type: String(body.type || "").trim(),
      teamSize: String(body.teamSize || "").trim(),
      startDate: String(body.startDate || "").trim(),
      meetingInfo: String(body.meetingInfo || "").trim(),
      createdAt: new Date().toISOString(),
    };

    if (!league.name || !league.day || !league.time) {
      return NextResponse.json(
        { error: "League name, day, and time are required." },
        { status: 400 },
      );
    }

    const store = await updateStore((s) => {
      s.leagues.push(league);
    });

    revalidatePath("/leagues");
    return NextResponse.json({ leagues: store.leagues, league });
  } catch {
    return NextResponse.json({ error: "Could not add league." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_leagues")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const id = String(body.id || "");
  if (!id) {
    return NextResponse.json({ error: "League id required." }, { status: 400 });
  }

  const store = await updateStore((s) => {
    const league = s.leagues.find((l) => l.id === id);
    if (!league) throw new Error("League not found");
    if (body.day !== undefined) league.day = String(body.day);
    if (body.time !== undefined) league.time = String(body.time);
    if (body.name !== undefined) league.name = String(body.name);
    if (body.type !== undefined) league.type = String(body.type);
    if (body.teamSize !== undefined) league.teamSize = String(body.teamSize);
    if (body.startDate !== undefined) league.startDate = String(body.startDate);
    if (body.meetingInfo !== undefined) league.meetingInfo = String(body.meetingInfo);
  });

  revalidatePath("/leagues");
  return NextResponse.json({ leagues: store.leagues });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_leagues")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "League id required." }, { status: 400 });
  }

  const store = await updateStore((s) => {
    s.leagues = s.leagues.filter((l) => l.id !== id);
  });

  revalidatePath("/leagues");
  return NextResponse.json({ leagues: store.leagues });
}

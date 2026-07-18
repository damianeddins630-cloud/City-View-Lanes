import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { persistenceMode, readStore, updateStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({
    hours: store.hours,
    persistence: persistenceMode(),
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_hours")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const hours = Array.isArray(body.hours) ? body.hours : null;
  if (!hours) {
    return NextResponse.json({ error: "Invalid hours payload." }, { status: 400 });
  }

  const store = await updateStore((s) => {
    s.hours = hours.map(
      (h: { day: string; open: string; close: string }) => ({
        day: String(h.day),
        open: String(h.open),
        close: String(h.close),
      }),
    );
  });

  revalidatePath("/hours");
  revalidatePath("/");

  return NextResponse.json({
    hours: store.hours,
    persistence: persistenceMode(),
    ok: true,
  });
}

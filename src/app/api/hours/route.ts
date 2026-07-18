import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import {
  PersistenceError,
  persistenceMode,
  readStore,
  storageSetupHelp,
  updateStore,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({
    hours: store.hours,
    persistence: persistenceMode(),
    updatedAt: new Date().toISOString(),
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_hours")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const hours = Array.isArray(body.hours) ? body.hours : null;
    if (!hours) {
      return NextResponse.json({ error: "Invalid hours payload." }, { status: 400 });
    }

    const { store, write } = await updateStore((s) => {
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
    revalidatePath("/admin");

    return NextResponse.json({
      hours: store.hours,
      persistence: write.mode,
      writeResult: write,
      ok: true,
      durable: write.durable,
    });
  } catch (error) {
    if (error instanceof PersistenceError) {
      return NextResponse.json(
        {
          error: error.message,
          persistence: persistenceMode(),
          durable: false,
          help: storageSetupHelp(),
        },
        { status: 503 },
      );
    }
    const message = error instanceof Error ? error.message : "Could not save hours.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

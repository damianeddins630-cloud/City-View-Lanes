import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const store = await readStore();
  const notifications = (store.notifications || [])
    .filter((n) => n.userId === user.id)
    .slice(0, 50);
  return NextResponse.json({ notifications });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const id = String(body.id || "");
    const markAll = Boolean(body.markAllRead);

    await updateStore((s) => {
      if (!Array.isArray(s.notifications)) s.notifications = [];
      if (markAll) {
        for (const n of s.notifications) {
          if (n.userId === user.id) n.read = true;
        }
        return;
      }
      const n = s.notifications.find((x) => x.id === id && x.userId === user.id);
      if (n) n.read = true;
    }, { requireDurable: false });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

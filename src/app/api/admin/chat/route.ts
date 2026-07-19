import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { makeId } from "@/lib/ids";

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "admin_chat")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const store = await readStore();
  const messages = store.chatMessages.map((m) => {
    const author = store.users.find((u) => u.id === m.userId);
    const role = store.roles.find((r) => r.id === author?.roleId);
    return {
      ...m,
      username: author?.username || "unknown",
      displayName: author
        ? `${author.firstName} ${author.lastName}`.trim() || author.username
        : "Unknown",
      roleName: role?.name || "",
    };
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "admin_chat")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const text = String(body.body || "").trim();
  if (!text) {
    return NextResponse.json({ error: "Message required." }, { status: 400 });
  }

  const message = {
    id: makeId("chat"),
    userId: user!.id,
    body: text,
    createdAt: new Date().toISOString(),
  };

  try {
    await updateStore((s) => {
      s.chatMessages.push(message);
    });
    return NextResponse.json({ message });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : "Could not send message.";
    return NextResponse.json({ error: messageText }, { status: 503 });
  }
}

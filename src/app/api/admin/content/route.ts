import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { setContentPath } from "@/lib/contentPath";
import { readStore, updateStore } from "@/lib/db";
import { ensureSiteContent } from "@/lib/siteContent";
import type { SiteContent } from "@/lib/types";

function canEditContent(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  return (
    hasPermission(user, "edit_site") || hasPermission(user, "manage_content")
  );
}

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/leagues");
  revalidatePath("/pro-shop");
  revalidatePath("/book");
  revalidatePath("/careers");
  revalidatePath("/hours");
}

export async function GET() {
  const user = await getCurrentUser();
  if (!canEditContent(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  return NextResponse.json({ content: ensureSiteContent(store.siteContent) });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!canEditContent(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const content = ensureSiteContent(body.content as SiteContent);
    await updateStore((s) => {
      s.siteContent = content;
    });
    revalidatePublicPages();
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Double-click edit mode: update one dotted path. */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!canEditContent(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const path = String(body.path || "").trim();
    const value = body.value;
    if (!path) {
      return NextResponse.json({ error: "Path required." }, { status: 400 });
    }
    if (typeof value !== "string" && typeof value !== "boolean") {
      return NextResponse.json({ error: "Value required." }, { status: 400 });
    }

    const { store } = await updateStore((s) => {
      const content = ensureSiteContent(s.siteContent);
      setContentPath(content, path, value);
      s.siteContent = ensureSiteContent(content);
    });

    revalidatePublicPages();
    return NextResponse.json({
      ok: true,
      content: ensureSiteContent(store.siteContent),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

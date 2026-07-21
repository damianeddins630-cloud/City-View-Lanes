import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setContentPath, mutateContentArray } from "@/lib/contentPath";
import { readStore, updateStore } from "@/lib/db";
import {
  canEditContentPath,
  canEditPage,
  canUploadSiteImages,
} from "@/lib/permissions";
import { ensureSiteContent } from "@/lib/siteContent";
import type { SiteContent } from "@/lib/types";

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
  if (!canUploadSiteImages(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  return NextResponse.json({ content: ensureSiteContent(store.siteContent) });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  // Full replace requires umbrella or both page perms.
  if (!canEditPage(user, "home") || !canEditPage(user, "leagues")) {
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

/** On-page Edit: update one dotted path, or append/remove list items. */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  try {
    const body = await request.json();
    const path = String(body.path || "").trim();
    const op = body.op ? String(body.op) : "";
    if (!path) {
      return NextResponse.json({ error: "Path required." }, { status: 400 });
    }
    if (!canEditContentPath(user, path)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // List add / remove
    if (op === "append" || op === "remove") {
      const { store } = await updateStore((s) => {
        const content = ensureSiteContent(s.siteContent);
        mutateContentArray(
          content,
          path,
          op,
          typeof body.index === "number" ? body.index : undefined,
          body.item,
        );
        s.siteContent = ensureSiteContent(content);
      });
      revalidatePublicPages();
      return NextResponse.json({
        ok: true,
        content: ensureSiteContent(store.siteContent),
      });
    }

    // Scalar field rename / edit
    const value = body.value;
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

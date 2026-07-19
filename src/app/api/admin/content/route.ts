import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
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
  if (!hasPermission(user, "manage_content")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  return NextResponse.json({ content: ensureSiteContent(store.siteContent) });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_content")) {
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

import { NextResponse } from "next/server";
import { readStore } from "@/lib/db";
import { ensureSiteContent } from "@/lib/siteContent";

/** Public site content for homepage / leagues youth section. */
export async function GET() {
  const store = await readStore();
  return NextResponse.json({ content: ensureSiteContent(store.siteContent) });
}

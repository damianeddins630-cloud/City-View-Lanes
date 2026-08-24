import { NextResponse } from "next/server";
import { isNeonConfigured, pingNeon } from "@/lib/neon";

export const dynamic = "force-dynamic";

/**
 * Safe Neon health check. Never returns connection strings or passwords.
 * GET /api/db/status
 */
export async function GET() {
  if (!isNeonConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error:
          "DATABASE_URL is not set. Add it in Vercel Environment Variables (after rotating any exposed password).",
      },
      { status: 503 },
    );
  }

  const ping = await pingNeon();
  return NextResponse.json(
    {
      ok: ping.ok,
      configured: true,
      latencyMs: ping.latencyMs,
      database: ping.database || null,
      error: ping.error || null,
    },
    { status: ping.ok ? 200 : 502 },
  );
}

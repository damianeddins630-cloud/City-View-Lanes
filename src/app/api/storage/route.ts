import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import {
  getBlobAuthInfo,
  persistenceMode,
  storageSetupHelp,
  testBlobRoundTrip,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const mode = persistenceMode();
  const durable = mode === "blob" || mode === "github" || mode === "file";
  const blobAuth = getBlobAuthInfo();

  const payload = {
    persistence: mode,
    durable,
    vercel: Boolean(process.env.VERCEL),
    hasBlobToken: blobAuth.hasReadWriteToken,
    hasBlobStoreId: blobAuth.hasStoreId,
    hasOidcToken: blobAuth.hasOidcToken,
    blobAuthMethod: blobAuth.method,
    blobCanAttempt: blobAuth.canAttempt,
    hasGithub: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO),
    help: durable ? null : storageSetupHelp(),
  };

  if (user && hasPermission(user, "view_admin")) {
    return NextResponse.json(payload);
  }

  return NextResponse.json({
    persistence: mode,
    durable,
  });
}

/** Admin-only: write a tiny probe blob and read it back. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "view_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await testBlobRoundTrip();
  const mode = persistenceMode();

  return NextResponse.json(
    {
      ok: result.ok,
      persistence: mode,
      durable: result.ok || mode === "github" || mode === "file",
      wrote: result.wrote,
      readBack: result.readBack,
      auth: result.auth,
      error: result.error || null,
      help: result.ok ? null : storageSetupHelp(),
    },
    { status: result.ok ? 200 : 503 },
  );
}

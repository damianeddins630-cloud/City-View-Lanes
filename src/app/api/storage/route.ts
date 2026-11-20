import { NextResponse } from "next/server";
import { canAccessAdminPanel, getCurrentUser } from "@/lib/auth";
import {
  getBlobAuthInfo,
  getLastBlobAccess,
  getLastBlobError,
  persistenceMode,
  storageSetupHelp,
  testBlobRoundTrip,
} from "@/lib/db";
import {
  getLastNeonError,
  isNeonConfigured,
  testNeonRoundTrip,
} from "@/lib/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const mode = persistenceMode();
  const blobAuth = getBlobAuthInfo();
  const neonConfigured = isNeonConfigured();
  const durable =
    mode === "neon" ||
    mode === "blob" ||
    mode === "github" ||
    mode === "file";
  const payload = {
    persistence: mode,
    durable,
    vercel: Boolean(process.env.VERCEL),
    neonConfigured,
    neonLastError: getLastNeonError() || null,
    hasBlobToken: blobAuth.hasReadWriteToken,
    hasBlobStoreId: blobAuth.hasStoreId,
    hasOidcToken: blobAuth.hasOidcToken,
    blobAuthMethod: blobAuth.method,
    blobCanAttempt: blobAuth.canAttempt,
    blobAccess: getLastBlobAccess(),
    blobLastError: getLastBlobError(),
    hasGithub: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO),
    help: durable ? null : storageSetupHelp(),
  };

  if (user && canAccessAdminPanel(user)) {
    return NextResponse.json(payload);
  }

  return NextResponse.json({
    persistence: mode,
    durable,
  });
}

/** Admin-only: probe Neon (preferred) or Blob and read it back. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdminPanel(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const mode = persistenceMode();

  if (isNeonConfigured()) {
    const result = await testNeonRoundTrip();
    return NextResponse.json(
      {
        ok: result.ok,
        persistence: mode,
        durable: result.ok || mode === "blob" || mode === "github" || mode === "file",
        backend: "neon",
        wrote: result.wrote,
        readBack: result.readBack,
        error: result.error || null,
        help: result.ok ? null : storageSetupHelp(),
      },
      { status: result.ok ? 200 : 503 },
    );
  }

  const result = await testBlobRoundTrip();

  return NextResponse.json(
    {
      ok: result.ok,
      persistence: mode,
      durable: result.ok || mode === "github" || mode === "file",
      backend: "blob",
      wrote: result.wrote,
      readBack: result.readBack,
      access: result.access || null,
      auth: result.auth,
      error: result.error || null,
      help: result.ok ? null : storageSetupHelp(),
    },
    { status: result.ok ? 200 : 503 },
  );
}

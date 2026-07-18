import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { persistenceMode, storageSetupHelp } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const mode = persistenceMode();
  const durable = mode === "blob" || mode === "github" || mode === "file";

  const payload = {
    persistence: mode,
    durable,
    vercel: Boolean(process.env.VERCEL),
    hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
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

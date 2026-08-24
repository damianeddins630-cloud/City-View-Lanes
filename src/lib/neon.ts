import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export class NeonConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NeonConfigError";
  }
}

/** Prefer pooled URL for serverless (Vercel). */
export function getDatabaseUrl(): string {
  const url = (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ""
  ).trim();
  if (!url) {
    throw new NeonConfigError(
      "Neon is not configured. Set DATABASE_URL (or POSTGRES_URL) in environment variables.",
    );
  }
  return url;
}

export function isNeonConfigured(): boolean {
  try {
    getDatabaseUrl();
    return true;
  } catch {
    return false;
  }
}

let sqlSingleton: NeonQueryFunction<false, false> | null = null;

/** Tagged-template SQL client for Neon (server-side only). */
export function sql() {
  if (!sqlSingleton) {
    sqlSingleton = neon(getDatabaseUrl());
  }
  return sqlSingleton;
}

export async function pingNeon(): Promise<{
  ok: boolean;
  latencyMs: number;
  database?: string;
  error?: string;
}> {
  const started = Date.now();
  try {
    const rows = await sql()`select current_database() as database, now() as ts`;
    const database =
      Array.isArray(rows) && rows[0] && typeof rows[0] === "object"
        ? String((rows[0] as { database?: string }).database || "")
        : "";
    return {
      ok: true,
      latencyMs: Date.now() - started,
      database: database || undefined,
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : "Neon ping failed",
    };
  }
}

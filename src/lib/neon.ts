import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Store } from "./types";

export class NeonConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NeonConfigError";
  }
}

const STORE_KEY = "cityview";

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
let schemaReady: Promise<void> | null = null;
let lastNeonError: string | undefined;

export function getLastNeonError() {
  return lastNeonError;
}

/** Tagged-template SQL client for Neon (server-side only). */
export function sql() {
  if (!sqlSingleton) {
    sqlSingleton = neon(getDatabaseUrl());
  }
  return sqlSingleton;
}

export async function ensureNeonStoreSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql()`
        create table if not exists cityview_store (
          id text primary key,
          data jsonb not null,
          updated_at timestamptz not null default now()
        )
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
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
    lastNeonError = undefined;
    return {
      ok: true,
      latencyMs: Date.now() - started,
      database: database || undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neon ping failed";
    lastNeonError = message;
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: message,
    };
  }
}

export async function readStoreFromNeon(): Promise<Store | null> {
  if (!isNeonConfigured()) return null;
  try {
    await ensureNeonStoreSchema();
    const rows = await sql()`
      select data
      from cityview_store
      where id = ${STORE_KEY}
      limit 1
    `;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const data = (rows[0] as { data?: Store }).data;
    if (!data || typeof data !== "object") return null;
    lastNeonError = undefined;
    return data;
  } catch (error) {
    lastNeonError = error instanceof Error ? error.message : String(error);
    console.error("[CityView DB] Neon read failed", lastNeonError);
    return null;
  }
}

export async function writeStoreToNeon(store: Store): Promise<boolean> {
  if (!isNeonConfigured()) return false;
  try {
    await ensureNeonStoreSchema();
    const payload = JSON.stringify(store);
    await sql()`
      insert into cityview_store (id, data, updated_at)
      values (${STORE_KEY}, ${payload}::jsonb, now())
      on conflict (id) do update
      set data = excluded.data,
          updated_at = now()
    `;
    lastNeonError = undefined;
    return true;
  } catch (error) {
    lastNeonError = error instanceof Error ? error.message : String(error);
    console.error("[CityView DB] Neon write failed", lastNeonError);
    return false;
  }
}

/** Admin probe: write then read a tiny marker row. */
export async function testNeonRoundTrip(): Promise<{
  ok: boolean;
  wrote: boolean;
  readBack: boolean;
  error?: string;
}> {
  if (!isNeonConfigured()) {
    return {
      ok: false,
      wrote: false,
      readBack: false,
      error: "DATABASE_URL is not set.",
    };
  }

  const probeKey = "cityview_probe";
  const marker = `cityview-probe-${Date.now()}`;
  try {
    await ensureNeonStoreSchema();
    await sql()`
      insert into cityview_store (id, data, updated_at)
      values (${probeKey}, ${JSON.stringify({ marker })}::jsonb, now())
      on conflict (id) do update
      set data = excluded.data,
          updated_at = now()
    `;
    const rows = await sql()`
      select data
      from cityview_store
      where id = ${probeKey}
      limit 1
    `;
    const data =
      Array.isArray(rows) && rows[0]
        ? ((rows[0] as { data?: { marker?: string } }).data ?? null)
        : null;
    const readBack = data?.marker === marker;
    lastNeonError = readBack ? undefined : "Neon probe marker mismatch";
    return {
      ok: readBack,
      wrote: true,
      readBack,
      error: readBack ? undefined : lastNeonError,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lastNeonError = message;
    return { ok: false, wrote: false, readBack: false, error: message };
  }
}

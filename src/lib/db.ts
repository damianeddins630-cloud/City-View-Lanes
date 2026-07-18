import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { FALL_LEAGUES_SEED } from "./fallLeaguesSeed";
import type { Store } from "./types";

const seedPath = path.join(process.cwd(), "data", "store.json");
const tmpPath = path.join("/tmp", "cityview-store.json");
const BLOB_NAME = "cityview/store.json";

export class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersistenceError";
  }
}

export type WriteResult = {
  blob: boolean;
  github: boolean;
  tmp: boolean;
  file: boolean;
  durable: boolean;
  mode: ReturnType<typeof persistenceMode>;
};

export type BlobAuthInfo = {
  hasReadWriteToken: boolean;
  hasStoreId: boolean;
  hasOidcToken: boolean;
  /** True when the Blob SDK has enough env to attempt auth. */
  canAttempt: boolean;
  method: "token" | "oidc" | "none";
};

type GlobalDb = {
  __cityviewStore?: Store;
  __cityviewStoreLoadedAt?: number;
};

function g(): GlobalDb {
  return globalThis as unknown as GlobalDb;
}

/**
 * Vercel Blob auth (2026+):
 * - Preferred on Vercel: OIDC via BLOB_STORE_ID + VERCEL_OIDC_TOKEN
 * - Fallback / legacy: BLOB_READ_WRITE_TOKEN
 * New Blob connects often only inject BLOB_STORE_ID — not the old RW token.
 */
export function getBlobAuthInfo(): BlobAuthInfo {
  const hasReadWriteToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  const hasStoreId = Boolean(process.env.BLOB_STORE_ID?.trim());
  const hasOidcToken = Boolean(process.env.VERCEL_OIDC_TOKEN?.trim());
  const method: BlobAuthInfo["method"] = hasReadWriteToken
    ? "token"
    : hasStoreId
      ? "oidc"
      : "none";
  // On Vercel, OIDC token is injected at runtime when store is connected.
  // Locally, store id alone is not enough without vercel env pull.
  const canAttempt =
    hasReadWriteToken || (hasStoreId && (hasOidcToken || isVercel()));

  return {
    hasReadWriteToken,
    hasStoreId,
    hasOidcToken,
    canAttempt,
    method,
  };
}

function hasBlobCredentials() {
  return getBlobAuthInfo().canAttempt;
}

function hasGithub() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

function isVercel() {
  return Boolean(process.env.VERCEL);
}

async function readSeed(): Promise<Store> {
  const raw = await fs.readFile(seedPath, "utf8");
  return JSON.parse(raw) as Store;
}

async function readJsonFile(filePath: string): Promise<Store | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, store: Store): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function readFromBlob(): Promise<Store | null> {
  if (!hasBlobCredentials()) return null;
  try {
    const result = await get(BLOB_NAME, {
      access: "public",
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as Store;
  } catch (error) {
    console.error("[CityView DB] Blob read failed", error);
    return null;
  }
}

async function writeToBlob(store: Store): Promise<boolean> {
  if (!hasBlobCredentials()) return false;
  try {
    await put(BLOB_NAME, JSON.stringify(store), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return true;
  } catch (error) {
    console.error("[CityView DB] Blob write failed", error);
    return false;
  }
}

async function readFromGithub(): Promise<Store | null> {
  if (!hasGithub()) return null;
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_TOKEN!;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/data/store.json?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "cityview-lanes",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: string; encoding?: string };
    if (!data.content) return null;
    const json = Buffer.from(data.content, "base64").toString("utf8");
    return JSON.parse(json) as Store;
  } catch (error) {
    console.error("[CityView DB] GitHub read failed", error);
    return null;
  }
}

async function writeToGithub(store: Store): Promise<boolean> {
  if (!hasGithub()) return false;
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_TOKEN!;
  try {
    const current = await fetch(
      `https://api.github.com/repos/${repo}/contents/data/store.json?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "cityview-lanes",
        },
        cache: "no-store",
      },
    );
    const currentJson = current.ok
      ? ((await current.json()) as { sha?: string })
      : {};

    const body = {
      message: "chore: update CityView live store data",
      content: Buffer.from(JSON.stringify(store, null, 2)).toString("base64"),
      branch,
      sha: currentJson.sha,
    };

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/data/store.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "cityview-lanes",
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      console.error("[CityView DB] GitHub write failed", await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[CityView DB] GitHub write failed", error);
    return false;
  }
}

export function persistenceMode() {
  const blob = getBlobAuthInfo();
  if (blob.canAttempt) return "blob";
  if (hasGithub()) return "github";
  if (!isVercel()) return "file";
  return "memory";
}

export function storageSetupHelp() {
  return "Saves need Vercel Blob. In Vercel → Storage → Blob → Create/Connect to THIS project (adds BLOB_STORE_ID and/or BLOB_READ_WRITE_TOKEN), then Deployments → Redeploy. After deploy, mode should be blob — not memory.";
}

/** Probe write/read against Blob so admins can verify saves without guessing. */
export async function testBlobRoundTrip(): Promise<{
  ok: boolean;
  auth: BlobAuthInfo;
  wrote: boolean;
  readBack: boolean;
  error?: string;
}> {
  const auth = getBlobAuthInfo();
  if (!auth.canAttempt) {
    return {
      ok: false,
      auth,
      wrote: false,
      readBack: false,
      error:
        "No Blob credentials on this deployment. Connect Blob storage to this Vercel project, then Redeploy.",
    };
  }

  const probePath = "cityview/_save-probe.json";
  const marker = `cityview-probe-${Date.now()}`;
  const payload = JSON.stringify({ marker, at: new Date().toISOString() });

  try {
    await put(probePath, payload, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      auth,
      wrote: false,
      readBack: false,
      error: `Blob write failed: ${message}`,
    };
  }

  try {
    const result = await get(probePath, {
      access: "public",
      useCache: false,
    });
    if (!result?.stream) {
      return {
        ok: false,
        auth,
        wrote: true,
        readBack: false,
        error: "Wrote probe but could not read it back (empty response).",
      };
    }
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as { marker?: string };
    const readBack = parsed.marker === marker;
    return {
      ok: readBack,
      auth,
      wrote: true,
      readBack,
      error: readBack
        ? undefined
        : "Wrote probe but read-back marker did not match.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      auth,
      wrote: true,
      readBack: false,
      error: `Blob read-back failed: ${message}`,
    };
  }
}

export async function readStore(): Promise<Store> {
  const cache = g();
  const now = Date.now();
  // Short in-request cache only — always reload from durable storage across requests.
  if (
    cache.__cityviewStore &&
    cache.__cityviewStoreLoadedAt &&
    now - cache.__cityviewStoreLoadedAt < 800
  ) {
    return structuredClone(cache.__cityviewStore);
  }

  const fromBlob = await readFromBlob();
  if (fromBlob) {
    cache.__cityviewStore = fromBlob;
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(fromBlob);
  }

  const fromGithub = await readFromGithub();
  if (fromGithub) {
    cache.__cityviewStore = fromGithub;
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(fromGithub);
  }

  function withLeagueSeed(store: Store): Store {
    if (!store.leagues?.length) {
      store.leagues = structuredClone(FALL_LEAGUES_SEED);
    }
    return store;
  }

  // Prefer project file locally; on Vercel prefer /tmp over seed so mid-session edits survive
  // within the same warm instance when Blob is not configured yet.
  if (!isVercel()) {
    const fromSeed = withLeagueSeed(
      (await readJsonFile(seedPath)) || (await readSeed()),
    );
    cache.__cityviewStore = fromSeed;
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(fromSeed);
  }

  const fromTmp = await readJsonFile(tmpPath);
  if (fromTmp) {
    cache.__cityviewStore = withLeagueSeed(fromTmp);
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(cache.__cityviewStore);
  }

  const fromSeed = withLeagueSeed(
    (await readJsonFile(seedPath)) || (await readSeed()),
  );
  cache.__cityviewStore = fromSeed;
  cache.__cityviewStoreLoadedAt = now;
  return structuredClone(fromSeed);
}

export async function writeStore(store: Store): Promise<WriteResult> {
  const cache = g();
  cache.__cityviewStore = structuredClone(store);
  cache.__cityviewStoreLoadedAt = Date.now();

  const [blob, github, tmp, file] = await Promise.all([
    writeToBlob(store),
    writeToGithub(store),
    writeJsonFile(tmpPath, store),
    isVercel() ? Promise.resolve(false) : writeJsonFile(seedPath, store),
  ]);

  const durable = blob || github || file;
  const mode = persistenceMode();

  if (!durable && isVercel()) {
    console.warn("[CityView DB]", storageSetupHelp());
  }

  return { blob, github, tmp, file, durable, mode };
}

export async function updateStore(
  mutator: (store: Store) => void | Promise<void>,
  options?: { requireDurable?: boolean },
): Promise<{ store: Store; write: WriteResult }> {
  const store = await readStore();
  await mutator(store);
  const write = await writeStore(store);

  const requireDurable = options?.requireDurable ?? isVercel();
  if (requireDurable && !write.durable) {
    throw new PersistenceError(storageSetupHelp());
  }

  return { store: structuredClone(store), write };
}

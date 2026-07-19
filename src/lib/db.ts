import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { FALL_LEAGUES_SEED } from "./fallLeaguesSeed";
import { ensureMasterAdmin } from "./masterAdmin";
import { ensureRoles } from "./roles";
import { ensureSiteContent } from "./siteContent";
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

type BlobAccess = "private" | "public";

type GlobalDb = {
  __cityviewStore?: Store;
  __cityviewStoreLoadedAt?: number;
  __cityviewBlobAccess?: BlobAccess;
  __cityviewBlobAccessError?: string;
};

function g(): GlobalDb {
  return globalThis as unknown as GlobalDb;
}

function blobAccessCandidates(): BlobAccess[] {
  const preferred = g().__cityviewBlobAccess;
  const fromEnv = process.env.BLOB_ACCESS?.trim().toLowerCase();
  const envAccess =
    fromEnv === "private" || fromEnv === "public" ? (fromEnv as BlobAccess) : null;
  // New Vercel Blob stores default to private; try that first, then public.
  const order: BlobAccess[] = [];
  for (const access of [preferred, envAccess, "private" as const, "public" as const]) {
    if (access && !order.includes(access)) order.push(access);
  }
  return order;
}

function rememberBlobAccess(access: BlobAccess) {
  g().__cityviewBlobAccess = access;
  g().__cityviewBlobAccessError = undefined;
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

type BlobAuthAttempt = {
  label: string;
  token?: string;
  storeId?: string;
};

function blobAuthAttempts(): BlobAuthAttempt[] {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
  const storeId = process.env.BLOB_STORE_ID?.trim() || undefined;
  const attempts: BlobAuthAttempt[] = [{ label: "sdk-default" }];
  if (token) attempts.push({ label: "rw-token", token });
  if (storeId) attempts.push({ label: "store-id", storeId });
  if (token && storeId) {
    attempts.push({ label: "token+store", token, storeId });
  }
  return attempts;
}

/** Oversized base64 avatars can break Blob uploads — strip them for persistence. */
function sanitizeStoreForBlob(store: Store): Store {
  const copy = structuredClone(store);
  for (const user of copy.users) {
    if (
      user.avatarUrl?.startsWith("data:") &&
      user.avatarUrl.length > 80_000
    ) {
      user.avatarUrl = "";
    }
  }
  return copy;
}

async function readFromBlob(): Promise<Store | null> {
  if (!hasBlobCredentials()) return null;
  const errors: string[] = [];

  for (const auth of blobAuthAttempts()) {
    for (const access of blobAccessCandidates()) {
      try {
        const result = await get(BLOB_NAME, {
          access,
          useCache: false,
          ...(auth.token ? { token: auth.token } : {}),
          ...(auth.storeId ? { storeId: auth.storeId } : {}),
        });
        if (!result || result.statusCode !== 200 || !result.stream) continue;
        const text = await new Response(result.stream).text();
        rememberBlobAccess(access);
        return JSON.parse(text) as Store;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${auth.label}/${access}: ${message}`);
      }
    }
  }

  if (errors.length) {
    g().__cityviewBlobAccessError = errors.slice(0, 6).join(" | ");
    console.error("[CityView DB] Blob read failed", errors.join(" | "));
  }
  return null;
}

async function writeToBlob(store: Store): Promise<boolean> {
  if (!hasBlobCredentials()) {
    g().__cityviewBlobAccessError =
      "No BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN on this deployment.";
    return false;
  }
  const body = JSON.stringify(sanitizeStoreForBlob(store));
  const errors: string[] = [];

  for (const auth of blobAuthAttempts()) {
    for (const access of blobAccessCandidates()) {
      try {
        await put(BLOB_NAME, body, {
          access,
          contentType: "application/json",
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
          ...(auth.token ? { token: auth.token } : {}),
          ...(auth.storeId ? { storeId: auth.storeId } : {}),
        });
        rememberBlobAccess(access);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${auth.label}/${access}: ${message}`);
      }
    }
  }

  g().__cityviewBlobAccessError = errors.slice(0, 8).join(" | ");
  console.error("[CityView DB] Blob write failed", errors.join(" | "));
  return false;
}

export function getLastBlobAccess(): BlobAccess | null {
  return g().__cityviewBlobAccess || null;
}

export function getLastBlobError(): string | null {
  return g().__cityviewBlobAccessError || null;
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
  return "Saves need Vercel Blob on THIS project. Storage → Blob → Create/Connect (adds BLOB_STORE_ID and/or BLOB_READ_WRITE_TOKEN), then Deployments → Redeploy. Open Admin → Test save now. Mode must be blob, not memory. See DEPLOY-SAVES.txt.";
}

/** Probe write/read against Blob so admins can verify saves without guessing. */
export async function testBlobRoundTrip(): Promise<{
  ok: boolean;
  auth: BlobAuthInfo;
  wrote: boolean;
  readBack: boolean;
  access?: BlobAccess;
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
  const writeErrors: string[] = [];

  let usedAccess: BlobAccess | null = null;
  let usedAuth: BlobAuthAttempt | null = null;
  for (const authAttempt of blobAuthAttempts()) {
    for (const access of blobAccessCandidates()) {
      try {
        await put(probePath, payload, {
          access,
          contentType: "application/json",
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
          ...(authAttempt.token ? { token: authAttempt.token } : {}),
          ...(authAttempt.storeId ? { storeId: authAttempt.storeId } : {}),
        });
        usedAccess = access;
        usedAuth = authAttempt;
        rememberBlobAccess(access);
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        writeErrors.push(`${authAttempt.label}/${access}: ${message}`);
      }
    }
    if (usedAccess) break;
  }

  if (!usedAccess || !usedAuth) {
    return {
      ok: false,
      auth,
      wrote: false,
      readBack: false,
      error: `Blob write failed. ${writeErrors.slice(0, 6).join(" | ")}`,
    };
  }

  try {
    const result = await get(probePath, {
      access: usedAccess,
      useCache: false,
      ...(usedAuth.token ? { token: usedAuth.token } : {}),
      ...(usedAuth.storeId ? { storeId: usedAuth.storeId } : {}),
    });
    if (!result?.stream) {
      return {
        ok: false,
        auth,
        wrote: true,
        readBack: false,
        access: usedAccess,
        error: `Wrote probe (${usedAccess}) but could not read it back (empty response).`,
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
      access: usedAccess,
      error: readBack
        ? undefined
        : `Wrote probe (${usedAccess}) but read-back marker did not match.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      auth,
      wrote: true,
      readBack: false,
      access: usedAccess,
      error: `Blob read-back failed (${usedAccess}): ${message}`,
    };
  }
}

/** Upload a site photo to Blob (prefer public URL). Falls back to /public/uploads. */
export async function uploadSiteImage(
  file: File | Buffer,
  filename: string,
  contentType: string,
): Promise<{ url: string; mode: "blob" | "local" }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const pathname = `cityview/uploads/${Date.now()}-${safeName}`;
  let body: Buffer;
  if (Buffer.isBuffer(file)) {
    body = file;
  } else {
    body = Buffer.from(await (file as File).arrayBuffer());
  }

  if (hasBlobCredentials()) {
    const errors: string[] = [];
    // Prefer public so the homepage can show the image without auth.
    for (const auth of blobAuthAttempts()) {
      for (const access of ["public", "private"] as BlobAccess[]) {
        try {
          const result = await put(pathname, body, {
            access,
            contentType,
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 60 * 60 * 24 * 30,
            ...(auth.token ? { token: auth.token } : {}),
            ...(auth.storeId ? { storeId: auth.storeId } : {}),
          });
          rememberBlobAccess(access);
          if (result?.url) {
            return { url: result.url, mode: "blob" };
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`${auth.label}/${access}: ${message}`);
        }
      }
    }
    console.error("[CityView] image upload blob failed", errors.join(" | "));
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const localName = `${Date.now()}-${safeName}`;
  await fs.writeFile(path.join(uploadsDir, localName), body);
  return { url: `/uploads/${localName}`, mode: "local" };
}

function finalizeStore(store: Store): Store {
  if (!Array.isArray(store.leagues)) store.leagues = [];
  if (!Array.isArray(store.leagueSignups)) store.leagueSignups = [];
  if (!Array.isArray(store.bookings)) store.bookings = [];
  if (!Array.isArray(store.employmentApplications)) {
    store.employmentApplications = [];
  }
  if (!Array.isArray(store.notifications)) store.notifications = [];
  if (!Array.isArray(store.chatMessages)) store.chatMessages = [];
  if (!Array.isArray(store.hours)) store.hours = [];
  if (!Array.isArray(store.users)) store.users = [];
  // Do NOT re-seed when empty — deleting all leagues must stay empty.
  // If leagues exist, merge any missing seed rows (e.g. new Youth lines).
  if (store.leagues.length > 0) {
    const have = new Set(store.leagues.map((l) => l.id));
    for (const seed of FALL_LEAGUES_SEED) {
      if (!have.has(seed.id)) store.leagues.push({ ...seed });
    }
  }
  store.siteContent = ensureSiteContent(store.siteContent);
  ensureRoles(store);
  ensureMasterAdmin(store);
  return store;
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
    return structuredClone(finalizeStore(cache.__cityviewStore));
  }

  const fromBlob = await readFromBlob();
  if (fromBlob) {
    cache.__cityviewStore = finalizeStore(fromBlob);
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(cache.__cityviewStore);
  }

  const fromGithub = await readFromGithub();
  if (fromGithub) {
    cache.__cityviewStore = finalizeStore(fromGithub);
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(cache.__cityviewStore);
  }

  // Prefer project file locally; on Vercel prefer /tmp over seed so mid-session edits survive
  // within the same warm instance when Blob is not configured yet.
  if (!isVercel()) {
    const fromSeed = finalizeStore(
      (await readJsonFile(seedPath)) || (await readSeed()),
    );
    cache.__cityviewStore = fromSeed;
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(fromSeed);
  }

  const fromTmp = await readJsonFile(tmpPath);
  if (fromTmp) {
    cache.__cityviewStore = finalizeStore(fromTmp);
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(cache.__cityviewStore);
  }

  const fromSeed = finalizeStore(
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
    const detail = getLastBlobError();
    throw new PersistenceError(
      detail ? `${storageSetupHelp()} Detail: ${detail}` : storageSetupHelp(),
    );
  }

  return { store: structuredClone(store), write };
}

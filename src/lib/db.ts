import { list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Store } from "./types";

const seedPath = path.join(process.cwd(), "data", "store.json");
const tmpPath = path.join("/tmp", "cityview-store.json");
const BLOB_NAME = "cityview/store.json";

type GlobalDb = {
  __cityviewStore?: Store;
  __cityviewStoreLoadedAt?: number;
};

function g(): GlobalDb {
  return globalThis as unknown as GlobalDb;
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function hasGithub() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
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
    await fs.writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function readFromBlob(): Promise<Store | null> {
  if (!hasBlobToken()) return null;
  try {
    const result = await list({ prefix: "cityview/", limit: 20 });
    const blob = result.blobs.find((b) => b.pathname === BLOB_NAME) || result.blobs[0];
    if (!blob?.url) return null;
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Store;
  } catch (error) {
    console.error("[CityView DB] Blob read failed", error);
    return null;
  }
}

async function writeToBlob(store: Store): Promise<boolean> {
  if (!hasBlobToken()) return false;
  try {
    await put(BLOB_NAME, JSON.stringify(store), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
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

export async function readStore(): Promise<Store> {
  const cache = g();
  const now = Date.now();
  // Keep a very short memory cache so rapid reads in one request stay fast,
  // but always re-load from durable storage across requests on Vercel.
  if (
    cache.__cityviewStore &&
    cache.__cityviewStoreLoadedAt &&
    now - cache.__cityviewStoreLoadedAt < 1500
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

  const fromTmp = await readJsonFile(tmpPath);
  if (fromTmp) {
    cache.__cityviewStore = fromTmp;
    cache.__cityviewStoreLoadedAt = now;
    return structuredClone(fromTmp);
  }

  const fromSeed = (await readJsonFile(seedPath)) || (await readSeed());
  cache.__cityviewStore = fromSeed;
  cache.__cityviewStoreLoadedAt = now;
  return structuredClone(fromSeed);
}

export async function writeStore(store: Store): Promise<{
  blob: boolean;
  github: boolean;
  tmp: boolean;
  file: boolean;
}> {
  const cache = g();
  cache.__cityviewStore = structuredClone(store);
  cache.__cityviewStoreLoadedAt = Date.now();

  const [blob, github, tmp, file] = await Promise.all([
    writeToBlob(store),
    writeToGithub(store),
    writeJsonFile(tmpPath, store),
    process.env.VERCEL ? Promise.resolve(false) : writeJsonFile(seedPath, store),
  ]);

  if (!blob && !github && process.env.VERCEL) {
    console.warn(
      "[CityView DB] No durable storage configured. Add BLOB_READ_WRITE_TOKEN (Vercel Blob) so hours/profile stick.",
    );
  }

  return { blob, github, tmp, file };
}

export async function updateStore(
  mutator: (store: Store) => void | Promise<void>,
): Promise<Store> {
  const store = await readStore();
  await mutator(store);
  await writeStore(store);
  return structuredClone(store);
}

export function persistenceMode() {
  if (hasBlobToken()) return "blob";
  if (hasGithub()) return "github";
  if (!process.env.VERCEL) return "file";
  return "memory";
}

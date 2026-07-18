import { head, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Store } from "./types";

const seedPath = path.join(process.cwd(), "data", "store.json");
const localPath = seedPath;
const BLOB_PATHNAME = "cityview-store.json";

type GlobalDb = {
  __cityviewStore?: Store;
  __cityviewStoreLoaded?: boolean;
};

function g(): GlobalDb {
  return globalThis as unknown as GlobalDb;
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readSeed(): Promise<Store> {
  const raw = await fs.readFile(seedPath, "utf8");
  return JSON.parse(raw) as Store;
}

async function readFromFile(): Promise<Store | null> {
  try {
    const raw = await fs.readFile(localPath, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return null;
  }
}

async function writeToFile(store: Store): Promise<boolean> {
  try {
    await fs.writeFile(localPath, JSON.stringify(store, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function readFromBlob(): Promise<Store | null> {
  if (!hasBlobToken()) return null;
  try {
    const meta = await head(BLOB_PATHNAME);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Store;
  } catch {
    return null;
  }
}

async function writeToBlob(store: Store): Promise<boolean> {
  if (!hasBlobToken()) return false;
  try {
    await put(BLOB_PATHNAME, JSON.stringify(store), {
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

export async function readStore(): Promise<Store> {
  const cache = g();
  if (cache.__cityviewStoreLoaded && cache.__cityviewStore) {
    return structuredClone(cache.__cityviewStore);
  }

  const fromBlob = await readFromBlob();
  if (fromBlob) {
    cache.__cityviewStore = fromBlob;
    cache.__cityviewStoreLoaded = true;
    return structuredClone(fromBlob);
  }

  const fromFile = await readFromFile();
  if (fromFile) {
    cache.__cityviewStore = fromFile;
    cache.__cityviewStoreLoaded = true;
    return structuredClone(fromFile);
  }

  const seed = await readSeed();
  cache.__cityviewStore = seed;
  cache.__cityviewStoreLoaded = true;
  return structuredClone(seed);
}

export async function writeStore(store: Store): Promise<void> {
  const cache = g();
  cache.__cityviewStore = structuredClone(store);
  cache.__cityviewStoreLoaded = true;

  const fileOk = await writeToFile(store);
  const blobOk = await writeToBlob(store);

  if (!fileOk && !blobOk && process.env.VERCEL) {
    console.warn(
      "[CityView DB] Saved in memory only. Add BLOB_READ_WRITE_TOKEN so changes persist on Vercel.",
    );
  }
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
  if (!process.env.VERCEL) return "file";
  return "memory";
}

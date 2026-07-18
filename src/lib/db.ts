import { promises as fs } from "fs";
import path from "path";
import type { Store } from "./types";

const seedPath = path.join(process.cwd(), "data", "store.json");

function runtimePath() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return path.join("/tmp", "cityview-store.json");
  }
  return seedPath;
}

async function ensureStore(): Promise<string> {
  const target = runtimePath();
  try {
    await fs.access(target);
    return target;
  } catch {
    const seed = await fs.readFile(seedPath, "utf8");
    if (target !== seedPath) {
      await fs.writeFile(target, seed, "utf8");
    }
    return target;
  }
}

export async function readStore(): Promise<Store> {
  const file = await ensureStore();
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as Store;
}

export async function writeStore(store: Store): Promise<void> {
  const file = await ensureStore();
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
}

export async function updateStore(
  mutator: (store: Store) => void | Promise<void>,
): Promise<Store> {
  const store = await readStore();
  await mutator(store);
  await writeStore(store);
  return store;
}

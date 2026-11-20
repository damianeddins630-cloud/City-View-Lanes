import { readFileSync } from "fs";
import path from "path";
import type { Product, ProductCategory, Store } from "./types";

type SpiCatalogFile = {
  categories: ProductCategory[];
  products: Array<
    Pick<
      Product,
      | "id"
      | "sku"
      | "upc"
      | "brand"
      | "family"
      | "name"
      | "description"
      | "priceCents"
      | "inventory"
      | "categoryId"
      | "imageUrl"
      | "imageAlt"
      | "active"
      | "createdAt"
      | "updatedAt"
    >
  >;
};

let cachedCatalog: SpiCatalogFile | null | undefined;

function loadSpiCatalog(): SpiCatalogFile | null {
  if (cachedCatalog !== undefined) return cachedCatalog;
  try {
    const filePath = path.join(process.cwd(), "data", "spi-catalog.json");
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as SpiCatalogFile;
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.products)) {
      cachedCatalog = null;
      return null;
    }
    cachedCatalog = parsed;
    return parsed;
  } catch {
    cachedCatalog = null;
    return null;
  }
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    sku: String(product.sku || "").trim(),
    upc: String(product.upc || "").trim(),
    brand: String(product.brand || "").trim(),
    family: String(product.family || "").trim(),
    name: String(product.name || "").trim(),
    description: String(product.description || "").trim(),
    priceCents: Number.isFinite(product.priceCents) ? product.priceCents : 0,
    inventory: Number.isFinite(product.inventory) ? product.inventory : 0,
    categoryId: String(product.categoryId || "").trim(),
    imageUrl: String(product.imageUrl || "").trim(),
    imageAlt: String(product.imageAlt || product.name || "").trim(),
    active: product.active !== false,
  };
}

/**
 * Ensures SPI categories/products exist in the store.
 * - Adds missing categories by id
 * - Upserts products by sku (or id): fills sku/upc/brand/family/name defaults
 * - Never overwrites admin-set price, inventory, active, or imageUrl
 * @returns number of newly inserted products (categories not counted)
 */
export function ensureSpiCatalog(store: Store): number {
  if (!Array.isArray(store.productCategories)) store.productCategories = [];
  if (!Array.isArray(store.products)) store.products = [];

  store.products = store.products.map((p) => normalizeProduct(p as Product));

  const catalog = loadSpiCatalog();
  if (!catalog) return 0;

  let added = 0;
  const now = new Date().toISOString();
  const catById = new Map(store.productCategories.map((c) => [c.id, c]));
  for (const seed of catalog.categories) {
    const existing = catById.get(seed.id);
    if (!existing) {
      store.productCategories.push({ ...seed });
      catById.set(seed.id, seed);
    } else {
      existing.name = existing.name || seed.name;
      existing.sortOrder =
        typeof existing.sortOrder === "number" ? existing.sortOrder : seed.sortOrder;
    }
  }
  store.productCategories.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const bySku = new Map<string, Product>();
  const byId = new Map<string, Product>();
  for (const p of store.products) {
    byId.set(p.id, p);
    if (p.sku) bySku.set(p.sku.toLowerCase(), p);
  }

  for (const seed of catalog.products) {
    const skuKey = seed.sku.toLowerCase();
    // Prefer exact id match so duplicate supplier SKUs (rare) stay distinct.
    let product = byId.get(seed.id) || (skuKey ? bySku.get(skuKey) : undefined);
    if (!product) {
      product = normalizeProduct({ ...seed });
      store.products.push(product);
      byId.set(product.id, product);
      if (product.sku && !bySku.has(product.sku.toLowerCase())) {
        bySku.set(product.sku.toLowerCase(), product);
      }
      added += 1;
      continue;
    }

    // Preserve ops-owned fields; fill catalog identity fields when empty.
    if (!product.sku) product.sku = seed.sku;
    if (!product.upc) product.upc = seed.upc;
    if (!product.brand) product.brand = seed.brand;
    if (!product.family) product.family = seed.family;
    if (!product.categoryId) product.categoryId = seed.categoryId;
    if (!product.name) product.name = seed.name;
    if (!product.description) product.description = seed.description;
    if (!product.imageAlt) product.imageAlt = seed.imageAlt || product.name;
    product.updatedAt = product.updatedAt || now;
  }

  return added;
}

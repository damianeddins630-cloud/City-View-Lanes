import { NextResponse } from "next/server";
import { readStore } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public catalog — active website products only (not Shopify). */
export async function GET() {
  const store = await readStore();
  const categories = [...store.productCategories]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((c) => ({ id: c.id, name: c.name, sortOrder: c.sortOrder }));

  const products = store.products
    .filter((p) => p.active)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      inventory: p.inventory,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl,
      imageAlt: p.imageAlt || p.name,
      active: p.active,
    }));

  return NextResponse.json({ products, categories });
}

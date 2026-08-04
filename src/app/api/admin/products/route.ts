import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { parseUsdToCents } from "@/lib/money";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

function revalidateShop() {
  revalidatePath("/pro-shop");
}

function parseInventory(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return null;
  return n;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_products") && !hasPermission(user, "manage_orders")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  const products = [...store.products].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return NextResponse.json({
    products,
    categories: store.productCategories,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_products")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const categoryId = String(body.categoryId || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const imageAlt = String(body.imageAlt || name).trim();
    const active = body.active === undefined ? true : Boolean(body.active);

    const priceCents =
      body.priceCents !== undefined
        ? (() => {
            const n = Math.round(Number(body.priceCents));
            return Number.isFinite(n) && n >= 0 ? n : null;
          })()
        : parseUsdToCents(body.price ?? body.priceDollars ?? "");

    const inventory = parseInventory(body.inventory);

    if (!name) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }
    if (priceCents === null) {
      return NextResponse.json(
        { error: "A valid price is required (e.g. 24.99)." },
        { status: 400 },
      );
    }
    if (inventory === null) {
      return NextResponse.json(
        { error: "Inventory must be a whole number of 0 or more." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    let product: Product | null = null;

    const { store } = await updateStore((s) => {
      if (categoryId && !s.productCategories.some((c) => c.id === categoryId)) {
        throw new Error("Selected category was not found.");
      }
      product = {
        id: makeId("prod"),
        name,
        description,
        priceCents,
        inventory,
        categoryId,
        imageUrl,
        imageAlt: imageAlt || name,
        active,
        createdAt: now,
        updatedAt: now,
      };
      s.products.push(product);
    });

    revalidateShop();
    return NextResponse.json({ products: store.products, product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_products")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "Product id required." }, { status: 400 });
    }

    const { store } = await updateStore((s) => {
      const product = s.products.find((p) => p.id === id);
      if (!product) throw new Error("Product not found");

      if (body.name !== undefined) {
        const name = String(body.name).trim();
        if (!name) throw new Error("Product name is required.");
        product.name = name;
      }
      if (body.description !== undefined) {
        product.description = String(body.description).trim();
      }
      if (body.priceCents !== undefined || body.price !== undefined || body.priceDollars !== undefined) {
        const priceCents =
          body.priceCents !== undefined
            ? Math.round(Number(body.priceCents))
            : parseUsdToCents(body.price ?? body.priceDollars ?? "");
        if (priceCents === null || !Number.isFinite(priceCents) || priceCents < 0) {
          throw new Error("A valid price is required (e.g. 24.99).");
        }
        product.priceCents = priceCents;
      }
      if (body.inventory !== undefined) {
        const inventory = parseInventory(body.inventory);
        if (inventory === null) {
          throw new Error("Inventory must be a whole number of 0 or more.");
        }
        product.inventory = inventory;
      }
      if (body.categoryId !== undefined) {
        const categoryId = String(body.categoryId || "").trim();
        if (categoryId && !s.productCategories.some((c) => c.id === categoryId)) {
          throw new Error("Selected category was not found.");
        }
        product.categoryId = categoryId;
      }
      if (body.imageUrl !== undefined) {
        product.imageUrl = String(body.imageUrl || "").trim();
      }
      if (body.imageAlt !== undefined) {
        product.imageAlt = String(body.imageAlt || "").trim() || product.name;
      }
      if (body.active !== undefined) {
        product.active = Boolean(body.active);
      }
      product.updatedAt = new Date().toISOString();
    });

    revalidateShop();
    return NextResponse.json({ products: store.products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_products")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Product id required." }, { status: 400 });
  }

  try {
    const { store } = await updateStore((s) => {
      const before = s.products.length;
      s.products = s.products.filter((p) => p.id !== id);
      if (s.products.length === before) throw new Error("Product not found");
    });

    revalidateShop();
    return NextResponse.json({ products: store.products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

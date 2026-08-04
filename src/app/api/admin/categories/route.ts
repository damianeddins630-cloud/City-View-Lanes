import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { updateStore, readStore } from "@/lib/db";
import { makeId } from "@/lib/ids";
import type { ProductCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

function revalidateShop() {
  revalidatePath("/pro-shop");
}

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_products") && !hasPermission(user, "manage_orders")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  const categories = [...store.productCategories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_products")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const now = new Date().toISOString();
    let category: ProductCategory | null = null;

    const { store } = await updateStore((s) => {
      const sortOrder =
        typeof body.sortOrder === "number"
          ? body.sortOrder
          : s.productCategories.length;
      category = {
        id: makeId("cat"),
        name,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      };
      s.productCategories.push(category);
    });

    revalidateShop();
    return NextResponse.json({
      categories: store.productCategories,
      category,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create category.";
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
      return NextResponse.json({ error: "Category id required." }, { status: 400 });
    }

    const { store } = await updateStore((s) => {
      const category = s.productCategories.find((c) => c.id === id);
      if (!category) throw new Error("Category not found");
      if (body.name !== undefined) {
        const name = String(body.name).trim();
        if (!name) throw new Error("Category name is required.");
        category.name = name;
      }
      if (body.sortOrder !== undefined) {
        category.sortOrder = Number(body.sortOrder) || 0;
      }
      category.updatedAt = new Date().toISOString();
    });

    revalidateShop();
    return NextResponse.json({ categories: store.productCategories });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update category.";
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
    return NextResponse.json({ error: "Category id required." }, { status: 400 });
  }

  try {
    const { store } = await updateStore((s) => {
      const inUse = s.products.some((p) => p.categoryId === id);
      if (inUse) {
        throw new Error(
          "Cannot delete a category that still has products. Reassign or remove those products first.",
        );
      }
      s.productCategories = s.productCategories.filter((c) => c.id !== id);
    });

    revalidateShop();
    return NextResponse.json({ categories: store.productCategories });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete category.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

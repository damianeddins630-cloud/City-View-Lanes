"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { centsToInputValue, formatUsd, parseUsdToCents } from "@/lib/money";
import type { Product, ProductCategory } from "@/lib/types";

type Props = {
  onNotice: (msg: string) => void;
  onError: (msg: string) => void;
};

const emptyForm = {
  name: "",
  description: "",
  price: "",
  inventory: "0",
  categoryId: "",
  imageUrl: "",
  imageAlt: "",
  active: true,
};

export default function AdminProductsPanel({ onNotice, onError }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categoryName, setCategoryName] = useState("");
  const [uploading, setUploading] = useState(false);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Could not load products.");
        return;
      }
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch {
      onError("Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: centsToInputValue(product.priceCents),
      inventory: String(product.inventory),
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
      active: product.active,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function uploadImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    onError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Image upload failed.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        imageUrl: data.url,
        imageAlt: prev.imageAlt || prev.name || file.name,
      }));
      onNotice("Product image uploaded. Save the product to keep it.");
    } catch {
      onError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    onError("");
    try {
      const priceCents = parseUsdToCents(form.price);
      if (priceCents === null) {
        onError("Enter a valid price (e.g. 24.99).");
        return;
      }
      const inventory = Number(form.inventory);
      if (!Number.isInteger(inventory) || inventory < 0) {
        onError("Inventory must be a whole number of 0 or more.");
        return;
      }

      const payload = {
        id: editingId || undefined,
        name: form.name.trim(),
        description: form.description.trim(),
        priceCents,
        inventory,
        categoryId: form.categoryId,
        imageUrl: form.imageUrl.trim(),
        imageAlt: form.imageAlt.trim() || form.name.trim(),
        active: form.active,
      };

      const res = await fetch("/api/admin/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Could not save product.");
        return;
      }
      setProducts(data.products || []);
      onNotice(editingId ? "Product updated." : "Product added.");
      resetForm();
    } catch {
      onError("Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Delete “${product.name}” permanently?`)) return;
    onError("");
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      onError(data.error || "Could not delete product.");
      return;
    }
    setProducts(data.products || []);
    if (editingId === product.id) resetForm();
    onNotice(`Removed “${product.name}”.`);
  }

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    onError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      onError(data.error || "Could not add category.");
      return;
    }
    setCategories(data.categories || []);
    setCategoryName("");
    if (data.category?.id) {
      setForm((prev) => ({ ...prev, categoryId: data.category.id }));
    }
    onNotice(`Category “${name}” added.`);
  }

  async function removeCategory(category: ProductCategory) {
    if (!window.confirm(`Delete category “${category.name}”?`)) return;
    onError("");
    const res = await fetch(
      `/api/admin/categories?id=${encodeURIComponent(category.id)}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (!res.ok) {
      onError(data.error || "Could not delete category.");
      return;
    }
    setCategories(data.categories || []);
    if (form.categoryId === category.id) {
      setForm((prev) => ({ ...prev, categoryId: "" }));
    }
    onNotice(`Removed category “${category.name}”.`);
  }

  if (loading) {
    return <p className="mt-6 text-sm text-[var(--muted)]">Loading products…</p>;
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-6">
        <form onSubmit={saveProduct} className="panel grid gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl text-[var(--ink)]">
              {editingId ? "Edit product" : "Add product"}
            </h2>
            {editingId ? (
              <button type="button" className="btn btn-ghost text-[10px]" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
          <p className="text-sm text-[var(--muted)]">
            Products, prices, and inventory are managed here — not in Shopify.
          </p>

          <div className="field">
            <label>Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label>Price (USD)</label>
              <input
                required
                inputMode="decimal"
                placeholder="24.99"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Inventory</label>
              <input
                required
                type="number"
                min={0}
                step={1}
                value={form.inventory}
                onChange={(e) => setForm({ ...form, inventory: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 rounded-lg border border-[var(--line)] p-3">
            <p className="text-xs font-bold tracking-wide text-[var(--blue)] uppercase">
              Product image
            </p>
            {form.imageUrl ? (
              <div className="relative h-40 overflow-hidden bg-[var(--blue-soft)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt={form.imageAlt || form.name || "Product"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">No image yet.</p>
            )}
            <div className="field">
              <label>Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="Upload below or paste a URL"
              />
            </div>
            <div className="field">
              <label>Image description (alt text)</label>
              <input
                value={form.imageAlt}
                onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="btn btn-ghost w-fit cursor-pointer text-[10px]">
                {uploading ? "Uploading…" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => void uploadImage(e.target.files?.[0] || null)}
                />
              </label>
              {form.imageUrl ? (
                <button
                  type="button"
                  className="btn btn-ghost text-[10px] ice-error"
                  onClick={() => setForm({ ...form, imageUrl: "", imageAlt: "" })}
                >
                  Remove image
                </button>
              ) : null}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active in Pro Shop catalog
          </label>

          <button type="submit" className="btn btn-primary w-fit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add product"}
          </button>
        </form>

        <form onSubmit={addCategory} className="panel grid gap-3 p-5">
          <h2 className="font-display text-2xl text-[var(--ink)]">Categories</h2>
          <div className="field">
            <label>New category name</label>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Balls, Shoes, Accessories…"
            />
          </div>
          <button type="submit" className="btn btn-ghost w-fit">
            Add category
          </button>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No categories yet.</p>
            ) : (
              categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-2"
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">{c.name}</p>
                  <button
                    type="button"
                    className="text-xs font-bold ice-error uppercase"
                    onClick={() => void removeCategory(c)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-2xl text-[var(--ink)]">
          Catalog ({products.length})
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No products yet. Add your first product to the left.
          </p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="panel flex gap-4 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden bg-[var(--blue-soft)]">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.imageAlt || product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-[var(--muted)]">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{product.name}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {formatUsd(product.priceCents)} · Qty {product.inventory}
                      {product.categoryId
                        ? ` · ${categoryMap.get(product.categoryId) || "Category"}`
                        : ""}
                      {!product.active ? " · Hidden" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost text-[10px]"
                      onClick={() => startEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs font-bold ice-error uppercase"
                      onClick={() => void removeProduct(product)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {product.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {product.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

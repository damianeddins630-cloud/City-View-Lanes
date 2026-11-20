"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { centsToInputValue, formatUsd, parseUsdToCents } from "@/lib/money";
import type { Product, ProductCategory } from "@/lib/types";

type Props = {
  onNotice: (msg: string) => void;
  onError: (msg: string) => void;
};

type FormState = {
  name: string;
  description: string;
  sku: string;
  upc: string;
  brand: string;
  family: string;
  price: string;
  inventory: string;
  categoryId: string;
  imageUrl: string;
  imageAlt: string;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  sku: "",
  upc: "",
  brand: "SPI",
  family: "",
  price: "0",
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categoryName, setCategoryName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out" | "unpriced">("all");
  const [page, setPage] = useState(0);
  const pageSize = 40;

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      if (stockFilter === "in" && p.inventory <= 0) return false;
      if (stockFilter === "out" && p.inventory > 0) return false;
      if (stockFilter === "unpriced" && p.priceCents > 0) return false;
      if (!q) return true;
      const hay = [
        p.name,
        p.sku,
        p.upc,
        p.brand,
        p.family,
        p.description,
        categoryMap.get(p.categoryId) || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [products, query, categoryFilter, stockFilter, categoryMap]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => {
    setPage(0);
  }, [query, categoryFilter, stockFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inventory > 0).length;
    const unpriced = products.filter((p) => p.priceCents <= 0).length;
    return { total, inStock, unpriced };
  }, [products]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      categoryId: categoryFilter !== "all" ? categoryFilter : categories[0]?.id || "",
    });
    setDrawerOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      sku: product.sku || "",
      upc: product.upc || "",
      brand: product.brand || "SPI",
      family: product.family || "",
      price: centsToInputValue(product.priceCents),
      inventory: String(product.inventory),
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
      active: product.active,
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
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
      onNotice("Image uploaded — save the product to keep it.");
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
        onError("Enter a valid price (0 is OK until you set retail).");
        return;
      }
      const inventory = Number(form.inventory);
      if (!Number.isInteger(inventory) || inventory < 0) {
        onError("Inventory must be a whole number ≥ 0.");
        return;
      }
      const payload = {
        id: editingId || undefined,
        name: form.name,
        description: form.description,
        sku: form.sku,
        upc: form.upc,
        brand: form.brand,
        family: form.family,
        priceCents,
        inventory,
        categoryId: form.categoryId,
        imageUrl: form.imageUrl,
        imageAlt: form.imageAlt || form.name,
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
      onNotice(editingId ? "Product updated." : "Product created.");
      closeDrawer();
    } catch {
      onError("Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function quickSave(
    product: Product,
    patch: Partial<{ priceCents: number; inventory: number; active: boolean }>,
  ) {
    onError("");
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Quick save failed.");
        return;
      }
      setProducts(data.products || []);
      onNotice(`Saved ${product.sku || product.name}.`);
    } catch {
      onError("Quick save failed.");
    }
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Remove ${product.name}?`)) return;
    onError("");
    try {
      const res = await fetch(
        `/api/admin/products?id=${encodeURIComponent(product.id)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Could not remove product.");
        return;
      }
      setProducts(data.products || []);
      onNotice("Product removed.");
    } catch {
      onError("Could not remove product.");
    }
  }

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    try {
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
      onNotice("Category added.");
    } catch {
      onError("Could not add category.");
    }
  }

  return (
    <div className="ops-console">
      <div className="ops-hero">
        <div>
          <p className="ops-kicker">Pro Shop Ops</p>
          <h2 className="ops-title">Catalog control</h2>
          <p className="ops-sub">
            Search, price, and stock SPI inventory. Changes save to durable storage
            (Neon when connected).
          </p>
        </div>
        <div className="ops-stats">
          <div>
            <span>{stats.total}</span>
            <small>SKUs</small>
          </div>
          <div>
            <span>{stats.inStock}</span>
            <small>In stock</small>
          </div>
          <div>
            <span>{stats.unpriced}</span>
            <small>Need price</small>
          </div>
        </div>
      </div>

      <div className="ops-toolbar">
        <input
          className="ops-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, SKU, UPC…"
          aria-label="Search products"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) =>
            setStockFilter(e.target.value as typeof stockFilter)
          }
          aria-label="Filter stock"
        >
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
          <option value="unpriced">Unpriced</option>
        </select>
        <button type="button" className="btn" onClick={() => void load()}>
          Refresh
        </button>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add product
        </button>
      </div>

      <div className="ops-table-wrap">
        {loading ? (
          <p className="ops-empty">Loading catalog…</p>
        ) : filtered.length === 0 ? (
          <p className="ops-empty">No products match this filter.</p>
        ) : (
          <table className="ops-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>UPC</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Live</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => (
                <tr key={p.id} className={p.active ? undefined : "is-off"}>
                  <td className="mono">{p.sku || "—"}</td>
                  <td>
                    <div className="ops-name">{p.name}</div>
                    {p.family ? <div className="ops-meta">{p.family}</div> : null}
                  </td>
                  <td>{categoryMap.get(p.categoryId) || "—"}</td>
                  <td className="mono">{p.upc || "—"}</td>
                  <td>
                    <input
                      className="ops-inline"
                      defaultValue={centsToInputValue(p.priceCents)}
                      key={`${p.id}-price-${p.priceCents}`}
                      onBlur={(e) => {
                        const next = parseUsdToCents(e.target.value);
                        if (next === null || next === p.priceCents) return;
                        void quickSave(p, { priceCents: next });
                      }}
                      aria-label={`Price for ${p.sku || p.name}`}
                    />
                  </td>
                  <td>
                    <input
                      className="ops-inline ops-inline-qty"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={p.inventory}
                      key={`${p.id}-qty-${p.inventory}`}
                      onBlur={(e) => {
                        const next = Number(e.target.value);
                        if (!Number.isInteger(next) || next < 0 || next === p.inventory) {
                          return;
                        }
                        void quickSave(p, { inventory: next });
                      }}
                      aria-label={`Qty for ${p.sku || p.name}`}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`ops-pill ${p.active ? "on" : "off"}`}
                      onClick={() => void quickSave(p, { active: !p.active })}
                    >
                      {p.active ? "On" : "Off"}
                    </button>
                  </td>
                  <td className="ops-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => void removeProduct(p)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="ops-pager">
        <span>
          Showing {filtered.length === 0 ? 0 : page * pageSize + 1}–
          {Math.min(filtered.length, (page + 1) * pageSize)} of {filtered.length}
        </span>
        <div className="ops-pager-btns">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      <form className="ops-cat-bar" onSubmit={addCategory}>
        <label>
          Add category
          <input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Apparel"
          />
        </label>
        <button type="submit" className="btn btn-secondary">
          Add
        </button>
      </form>

      {drawerOpen ? (
        <div className="ops-drawer-backdrop" onClick={closeDrawer}>
          <aside
            className="ops-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={editingId ? "Edit product" : "Add product"}
          >
            <div className="ops-drawer-head">
              <h3>{editingId ? "Edit product" : "Add product"}</h3>
              <button type="button" className="btn btn-secondary" onClick={closeDrawer}>
                Close
              </button>
            </div>
            <form className="ops-drawer-form" onSubmit={saveProduct}>
              <label>
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <div className="ops-grid-2">
                <label>
                  SKU
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  />
                </label>
                <label>
                  UPC
                  <input
                    value={form.upc}
                    onChange={(e) => setForm((f) => ({ ...f, upc: e.target.value }))}
                  />
                </label>
              </div>
              <div className="ops-grid-2">
                <label>
                  Brand
                  <input
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  />
                </label>
                <label>
                  Family
                  <input
                    value={form.family}
                    onChange={(e) => setForm((f) => ({ ...f, family: e.target.value }))}
                  />
                </label>
              </div>
              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </label>
              <div className="ops-grid-2">
                <label>
                  Price (USD)
                  <input
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </label>
                <label>
                  Inventory
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.inventory}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, inventory: e.target.value }))
                    }
                  />
                </label>
              </div>
              <label>
                Category
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Image URL
                <input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                />
              </label>
              <label>
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => void uploadImage(e.target.files?.[0] || null)}
                />
              </label>
              <label className="ops-check">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                />
                Show on Pro Shop
              </label>
              <div className="ops-drawer-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save product"}
                </button>
                {editingId ? (
                  <span className="ops-meta">
                    Current: {formatUsd(
                      parseUsdToCents(form.price) ?? 0,
                    )}
                  </span>
                ) : null}
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

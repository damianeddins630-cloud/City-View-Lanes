"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { formatUsd } from "@/lib/money";
import type { Product, ProductCategory } from "@/lib/types";

export type CatalogProduct = Pick<
  Product,
  | "id"
  | "name"
  | "description"
  | "priceCents"
  | "inventory"
  | "categoryId"
  | "imageUrl"
  | "imageAlt"
  | "active"
>;

export type CatalogCategory = Pick<ProductCategory, "id" | "name" | "sortOrder">;

type Props = {
  initialProducts: CatalogProduct[];
  initialCategories: CatalogCategory[];
};

function availabilityLabel(inventory: number) {
  if (inventory <= 0) return { text: "Out of stock", tone: "oos" as const };
  if (inventory <= 3) {
    return {
      text: inventory === 1 ? "Only 1 left" : `Only ${inventory} left`,
      tone: "low" as const,
    };
  }
  return { text: "In stock", tone: "ok" as const };
}

export default function ProShopStorefront({
  initialProducts,
  initialCategories,
}: Props) {
  const { lines, ready, itemCount, addItem, setQuantity, removeItem, getQuantity } =
    useCart();
  const [products, setProducts] = useState(initialProducts);
  const [categories] = useState(initialCategories);
  const [filter, setFilter] = useState<string>("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !Array.isArray(d.products)) return;
        setProducts(d.products);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const productMap = useMemo(() => {
    const map = new Map<string, CatalogProduct>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  // Drop removed products and clamp quantities to live website inventory.
  useEffect(() => {
    if (!ready) return;
    for (const line of lines) {
      const product = productMap.get(line.productId);
      if (!product || product.inventory <= 0) {
        removeItem(line.productId);
        continue;
      }
      if (line.quantity > product.inventory) {
        setQuantity(line.productId, product.inventory, product.inventory);
      }
    }
  }, [ready, lines, productMap, removeItem, setQuantity]);

  const visibleProducts = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.categoryId === filter);
  }, [products, filter]);

  const cartRows = useMemo(() => {
    return lines
      .map((line) => {
        const product = productMap.get(line.productId);
        if (!product) return null;
        return { line, product };
      })
      .filter((row): row is { line: (typeof lines)[number]; product: CatalogProduct } =>
        Boolean(row),
      );
  }, [lines, productMap]);

  const subtotalCents = useMemo(
    () =>
      cartRows.reduce(
        (sum, row) => sum + row.product.priceCents * row.line.quantity,
        0,
      ),
    [cartRows],
  );

  function flashError(msg: string) {
    setNotice("");
    setError(msg);
  }

  function flashNotice(msg: string) {
    setError("");
    setNotice(msg);
  }

  function onAdd(product: CatalogProduct) {
    const err = addItem(product.id, product.inventory, 1);
    if (err) {
      flashError(err);
      setCartOpen(true);
      return;
    }
    flashNotice(`Added “${product.name}” to cart.`);
    setCartOpen(true);
  }

  return (
    <section id="pro-shop-store" className="proshop-store">
      <div className="mx-auto w-[min(1140px,calc(100%-1.5rem))] py-14">
        <div className="proshop-store-head">
          <div>
            <p className="proshop-store-kicker">Online Pro Shop</p>
            <h2 className="proshop-store-title">Shop equipment & gear</h2>
            <p className="proshop-store-copy">
              Browse live inventory from Ballard&apos;s Bowling Academy. Prices and
              stock are managed on this website — checkout will use secure Shopify
              payment next.
            </p>
          </div>
          <button
            type="button"
            className="proshop-cart-launch"
            onClick={() => setCartOpen(true)}
          >
            <span>Cart</span>
            <span className="proshop-cart-count" aria-live="polite">
              {ready ? itemCount : 0}
            </span>
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="proshop-filters" role="tablist" aria-label="Product categories">
            <button
              type="button"
              role="tab"
              aria-selected={filter === "all"}
              className={`proshop-filter ${filter === "all" ? "is-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={filter === c.id}
                className={`proshop-filter ${filter === c.id ? "is-active" : ""}`}
                onClick={() => setFilter(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : null}

        {notice ? <p className="proshop-banner is-ok">{notice}</p> : null}
        {error ? <p className="proshop-banner is-error">{error}</p> : null}

        {visibleProducts.length === 0 ? (
          <div className="proshop-empty">
            <p className="proshop-empty-title">Catalog coming soon</p>
            <p className="proshop-empty-copy">
              Products added in Admin → Products will appear here when marked active.
            </p>
          </div>
        ) : (
          <div className="proshop-grid">
            {visibleProducts.map((product, index) => {
              const stock = availabilityLabel(product.inventory);
              const inCart = getQuantity(product.id);
              const soldOut = product.inventory <= 0;
              return (
                <article
                  key={product.id}
                  className="proshop-card"
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                >
                  <div className="proshop-card-media">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.imageAlt || product.name}
                      />
                    ) : (
                      <div className="proshop-card-placeholder">No photo</div>
                    )}
                    <span className={`proshop-stock is-${stock.tone}`}>{stock.text}</span>
                  </div>
                  <div className="proshop-card-body">
                    {product.categoryId ? (
                      <p className="proshop-card-category">
                        {categoryMap.get(product.categoryId) || "Gear"}
                      </p>
                    ) : null}
                    <h3 className="proshop-card-name">{product.name}</h3>
                    {product.description ? (
                      <p className="proshop-card-desc">{product.description}</p>
                    ) : null}
                    <div className="proshop-card-row">
                      <p className="proshop-card-price">{formatUsd(product.priceCents)}</p>
                      {inCart > 0 ? (
                        <p className="proshop-card-incart">{inCart} in cart</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="proshop-add-btn"
                      disabled={soldOut}
                      onClick={() => onAdd(product)}
                    >
                      {soldOut ? "Out of stock" : "Add to cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {cartOpen ? (
        <div
          className="proshop-cart-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          onClick={() => setCartOpen(false)}
        >
          <aside className="proshop-cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="proshop-cart-top">
              <div>
                <p className="proshop-store-kicker">Your cart</p>
                <h3 className="proshop-cart-title">
                  {itemCount === 0
                    ? "Empty"
                    : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
                </h3>
              </div>
              <button
                type="button"
                className="proshop-cart-close"
                onClick={() => setCartOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="proshop-cart-lines">
              {cartRows.length === 0 ? (
                <p className="proshop-empty-copy">
                  Add gear from the catalog to get started.
                </p>
              ) : (
                cartRows.map(({ line, product }) => (
                  <div key={product.id} className="proshop-cart-line">
                    <div className="proshop-cart-thumb">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.imageAlt || product.name}
                        />
                      ) : (
                        <div className="proshop-card-placeholder">—</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="proshop-cart-line-name">{product.name}</p>
                      <p className="proshop-cart-line-meta">
                        {formatUsd(product.priceCents)} ·{" "}
                        {product.inventory > 0
                          ? `${product.inventory} available`
                          : "Out of stock"}
                      </p>
                      <div className="proshop-qty">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => {
                            const err = setQuantity(
                              product.id,
                              line.quantity - 1,
                              product.inventory,
                            );
                            if (err) flashError(err);
                          }}
                        >
                          −
                        </button>
                        <span aria-live="polite">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => {
                            const err = setQuantity(
                              product.id,
                              line.quantity + 1,
                              product.inventory,
                            );
                            if (err) flashError(err);
                          }}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="proshop-cart-remove"
                          onClick={() => removeItem(product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="proshop-cart-line-total">
                      {formatUsd(product.priceCents * line.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="proshop-cart-footer">
              <div className="proshop-cart-subtotal">
                <span>Subtotal</span>
                <strong>{formatUsd(subtotalCents)}</strong>
              </div>
              <p className="proshop-cart-note">
                Taxes and shipping are calculated at secure checkout.
              </p>
              <button
                type="button"
                className="proshop-checkout-btn"
                disabled={cartRows.length === 0}
                title="Shopify checkout connects in the next phase"
                onClick={() => {
                  flashNotice(
                    "Checkout is ready to connect. Shopify Draft Order payment will be enabled in the next phase.",
                  );
                }}
              >
                Checkout
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

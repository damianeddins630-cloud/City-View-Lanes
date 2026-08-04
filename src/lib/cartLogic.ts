export type CartLine = {
  productId: string;
  quantity: number;
};

export type CatalogStock = {
  id: string;
  inventory: number;
};

const MAX_LINE_QTY = 99;

export function clampQty(quantity: number, maxInventory: number): number {
  const q = Math.floor(quantity);
  if (!Number.isFinite(q) || q < 1) return 0;
  const max = Math.min(
    MAX_LINE_QTY,
    Number.isFinite(maxInventory) ? Math.max(0, Math.floor(maxInventory)) : 0,
  );
  return Math.min(q, max);
}

/** Pure add — safe for React Strict Mode double-invokes. */
export function addCartLine(
  lines: CartLine[],
  productId: string,
  maxInventory: number,
  qty = 1,
): { lines: CartLine[]; error: string | null } {
  const addQty = Math.floor(qty);
  if (!productId || addQty < 1) {
    return { lines, error: "Invalid quantity." };
  }
  if (!Number.isFinite(maxInventory) || maxInventory < 1) {
    return { lines, error: "This item is out of stock." };
  }

  const existing = lines.find((l) => l.productId === productId);
  const current = existing?.quantity || 0;
  const desired = current + addQty;
  const capped = clampQty(desired, maxInventory);

  if (capped < 1) {
    return { lines, error: "This item is out of stock." };
  }

  let error: string | null = null;
  if (desired > capped) {
    error =
      maxInventory === 1
        ? "Only 1 left in stock."
        : `Only ${maxInventory} available in stock.`;
  }

  if (existing) {
    if (existing.quantity === capped) return { lines, error };
    return {
      lines: lines.map((l) =>
        l.productId === productId ? { ...l, quantity: capped } : l,
      ),
      error,
    };
  }

  return {
    lines: [...lines, { productId, quantity: capped }],
    error,
  };
}

/** Pure quantity set. */
export function setCartLineQuantity(
  lines: CartLine[],
  productId: string,
  quantity: number,
  maxInventory: number,
): { lines: CartLine[]; error: string | null } {
  const next = Math.floor(quantity);
  if (next <= 0) {
    return {
      lines: lines.filter((l) => l.productId !== productId),
      error: null,
    };
  }
  if (!Number.isFinite(maxInventory) || maxInventory < 1) {
    return {
      lines: lines.filter((l) => l.productId !== productId),
      error: "This item is out of stock.",
    };
  }

  const capped = clampQty(next, maxInventory);
  const error =
    next > capped
      ? `Only ${maxInventory} available in stock.`
      : null;

  const exists = lines.some((l) => l.productId === productId);
  if (!exists) {
    return {
      lines: [...lines, { productId, quantity: capped }],
      error,
    };
  }
  return {
    lines: lines.map((l) =>
      l.productId === productId ? { ...l, quantity: capped } : l,
    ),
    error,
  };
}

/** Drop missing/OOS items and clamp quantities to live website stock. */
export function syncCartWithCatalog(
  lines: CartLine[],
  catalog: CatalogStock[],
): CartLine[] {
  const stock = new Map(catalog.map((p) => [p.id, p.inventory]));
  const next: CartLine[] = [];
  for (const line of lines) {
    const inventory = stock.get(line.productId);
    if (inventory === undefined || inventory < 1) continue;
    const quantity = clampQty(line.quantity, inventory);
    if (quantity < 1) continue;
    next.push({ productId: line.productId, quantity });
  }
  return next;
}

export function cartLinesEqual(a: CartLine[], b: CartLine[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].productId !== b[i].productId || a[i].quantity !== b[i].quantity) {
      return false;
    }
  }
  return true;
}

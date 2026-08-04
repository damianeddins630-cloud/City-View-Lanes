"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "cityview_proshop_cart_v1";

export type CartLine = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  itemCount: number;
  getQuantity: (productId: string) => number;
  addItem: (productId: string, maxInventory: number, qty?: number) => string | null;
  setQuantity: (productId: string, quantity: number, maxInventory: number) => string | null;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        const productId = String((row as CartLine)?.productId || "");
        const quantity = Math.floor(Number((row as CartLine)?.quantity));
        if (!productId || !Number.isFinite(quantity) || quantity < 1) return null;
        return { productId, quantity };
      })
      .filter((row): row is CartLine => Boolean(row));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStoredLines());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore quota / private-mode write failures.
    }
  }, [lines, ready]);

  const getQuantity = useCallback(
    (productId: string) => lines.find((l) => l.productId === productId)?.quantity || 0,
    [lines],
  );

  const addItem = useCallback(
    (productId: string, maxInventory: number, qty = 1): string | null => {
      const addQty = Math.floor(qty);
      if (!productId || addQty < 1) return "Invalid quantity.";
      if (!Number.isFinite(maxInventory) || maxInventory < 1) {
        return "This item is out of stock.";
      }

      let error: string | null = null;
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === productId);
        const current = existing?.quantity || 0;
        const nextQty = current + addQty;
        if (nextQty > maxInventory) {
          error =
            maxInventory === 1
              ? "Only 1 left in stock."
              : `Only ${maxInventory} available in stock.`;
          if (current >= maxInventory) return prev;
          return prev.map((l) =>
            l.productId === productId ? { ...l, quantity: maxInventory } : l,
          );
        }
        if (existing) {
          return prev.map((l) =>
            l.productId === productId ? { ...l, quantity: nextQty } : l,
          );
        }
        return [...prev, { productId, quantity: nextQty }];
      });
      return error;
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number, maxInventory: number): string | null => {
      const next = Math.floor(quantity);
      if (next <= 0) {
        setLines((prev) => prev.filter((l) => l.productId !== productId));
        return null;
      }
      if (!Number.isFinite(maxInventory) || maxInventory < 1) {
        setLines((prev) => prev.filter((l) => l.productId !== productId));
        return "This item is out of stock.";
      }
      if (next > maxInventory) {
        setLines((prev) => {
          const exists = prev.some((l) => l.productId === productId);
          if (!exists) {
            return [...prev, { productId, quantity: maxInventory }];
          }
          return prev.map((l) =>
            l.productId === productId ? { ...l, quantity: maxInventory } : l,
          );
        });
        return `Only ${maxInventory} available in stock.`;
      }
      setLines((prev) => {
        const exists = prev.some((l) => l.productId === productId);
        if (!exists) return [...prev, { productId, quantity: next }];
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: next } : l,
        );
      });
      return null;
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      ready,
      itemCount,
      getQuantity,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [
      lines,
      ready,
      itemCount,
      getQuantity,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

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
import {
  addCartLine,
  cartLinesEqual,
  setCartLineQuantity,
  syncCartWithCatalog,
  type CartLine,
  type CatalogStock,
} from "@/lib/cartLogic";

const STORAGE_KEY = "cityview_proshop_cart_v1";

export type { CartLine };

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  itemCount: number;
  getQuantity: (productId: string) => number;
  addItem: (productId: string, maxInventory: number, qty?: number) => string | null;
  setQuantity: (productId: string, quantity: number, maxInventory: number) => string | null;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  syncWithCatalog: (catalog: CatalogStock[]) => void;
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
      let error: string | null = null;
      setLines((prev) => {
        const result = addCartLine(prev, productId, maxInventory, qty);
        error = result.error;
        return result.lines;
      });
      return error;
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number, maxInventory: number): string | null => {
      let error: string | null = null;
      setLines((prev) => {
        const result = setCartLineQuantity(prev, productId, quantity, maxInventory);
        error = result.error;
        return result.lines;
      });
      return error;
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const syncWithCatalog = useCallback((catalog: CatalogStock[]) => {
    setLines((prev) => {
      const next = syncCartWithCatalog(prev, catalog);
      return cartLinesEqual(prev, next) ? prev : next;
    });
  }, []);

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
      syncWithCatalog,
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
      syncWithCatalog,
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

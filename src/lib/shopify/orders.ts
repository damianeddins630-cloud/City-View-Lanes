import type {
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  ShopOrder,
  ShopOrderLineItem,
  Store,
} from "@/lib/types";
import { makeId } from "@/lib/ids";

type ShopifyNoteAttribute = { name?: string; value?: string };
type ShopifyLineProperty = { name?: string; value?: string };
type ShopifyLineItem = {
  title?: string;
  quantity?: number;
  price?: string;
  sku?: string;
  properties?: ShopifyLineProperty[];
};
type ShopifyCustomer = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type ShopifyOrderPayload = {
  id?: number | string;
  email?: string;
  created_at?: string;
  total_price?: string;
  subtotal_price?: string;
  currency?: string;
  financial_status?: string;
  fulfillment_status?: string | null;
  note?: string;
  note_attributes?: ShopifyNoteAttribute[];
  line_items?: ShopifyLineItem[];
  customer?: ShopifyCustomer | null;
  tags?: string;
};

function dollarsToCents(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[$,]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function noteAttr(payload: ShopifyOrderPayload, name: string): string {
  const rows = payload.note_attributes || [];
  const hit = rows.find(
    (r) => String(r.name || "").toLowerCase() === name.toLowerCase(),
  );
  return String(hit?.value || "").trim();
}

export function extractWebsiteOrderId(payload: ShopifyOrderPayload): string {
  const fromAttr = noteAttr(payload, "website_order_id");
  if (fromAttr.startsWith("ord_")) return fromAttr;

  for (const line of payload.line_items || []) {
    for (const prop of line.properties || []) {
      if (String(prop.name || "") === "_website_order_id") {
        const v = String(prop.value || "").trim();
        if (v.startsWith("ord_")) return v;
      }
    }
  }

  const note = String(payload.note || "");
  const match = note.match(/\bord_[a-zA-Z0-9_]+/);
  return match?.[0] || "";
}

function mapFinancialStatus(status: string | undefined): OrderPaymentStatus {
  const s = (status || "").toLowerCase();
  if (s === "paid" || s === "partially_paid") return "paid";
  if (s === "refunded" || s === "partially_refunded") return "refunded";
  if (s === "voided") return "cancelled";
  if (s === "pending" || s === "authorized") return "pending";
  return "pending";
}

function mapFulfillmentStatus(
  status: string | null | undefined,
): OrderFulfillmentStatus {
  const s = (status || "").toLowerCase();
  if (s === "fulfilled") return "fulfilled";
  if (s === "partial") return "partial";
  if (s === "restocked") return "cancelled";
  return "unfulfilled";
}

function customerNameFromPayload(payload: ShopifyOrderPayload): string {
  const first = payload.customer?.first_name || "";
  const last = payload.customer?.last_name || "";
  const full = `${first} ${last}`.trim();
  return full || "Shopify customer";
}

function lineItemsFromPayload(payload: ShopifyOrderPayload): ShopOrderLineItem[] {
  return (payload.line_items || []).map((line) => {
    const fromProp = (line.properties || []).find(
      (p) => String(p.name || "") === "_website_product_id",
    );
    const productId = String(fromProp?.value || line.sku || "").trim() || "unknown";
    return {
      productId,
      name: String(line.title || "Item"),
      quantity: Math.max(1, Math.floor(Number(line.quantity) || 1)),
      unitPriceCents: dollarsToCents(line.price),
    };
  });
}

function decrementInventoryForOrder(store: Store, order: ShopOrder): void {
  for (const item of order.lineItems) {
    if (!item.productId || item.productId === "unknown") continue;
    const product = store.products.find((p) => p.id === item.productId);
    if (!product) continue;
    product.inventory = Math.max(0, product.inventory - item.quantity);
    product.updatedAt = new Date().toISOString();
  }
}

/**
 * Apply a paid/updated Shopify order to the website store.
 * Idempotent: inventory decrements only on first transition to paid.
 */
export function applyShopifyOrderToStore(
  store: Store,
  payload: ShopifyOrderPayload,
  options?: { forcePaid?: boolean },
): { order: ShopOrder; inventoryUpdated: boolean; created: boolean } {
  const shopifyOrderId = payload.id != null ? String(payload.id) : "";
  const websiteOrderId = extractWebsiteOrderId(payload);
  const now = new Date().toISOString();

  let order =
    (websiteOrderId
      ? store.shopOrders.find((o) => o.id === websiteOrderId)
      : undefined) ||
    (shopifyOrderId
      ? store.shopOrders.find((o) => o.shopifyOrderId === shopifyOrderId)
      : undefined);

  const created = !order;
  if (!order) {
    const lineItems = lineItemsFromPayload(payload);
    const subtotalCents =
      dollarsToCents(payload.subtotal_price) ||
      lineItems.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
    order = {
      id: websiteOrderId || makeId("ord"),
      shopifyOrderId: shopifyOrderId || undefined,
      customerName: customerNameFromPayload(payload),
      customerEmail: String(payload.email || payload.customer?.email || "").trim(),
      lineItems,
      subtotalCents,
      totalCents: dollarsToCents(payload.total_price) || subtotalCents,
      currency: String(payload.currency || "USD"),
      paymentStatus: "pending",
      fulfillmentStatus: mapFulfillmentStatus(payload.fulfillment_status),
      createdAt: payload.created_at || now,
      updatedAt: now,
    };
    store.shopOrders.unshift(order);
  }

  const wasPaid = order.paymentStatus === "paid";
  const nextPayment = options?.forcePaid
    ? "paid"
    : mapFinancialStatus(payload.financial_status);

  if (shopifyOrderId) order.shopifyOrderId = shopifyOrderId;

  const email = String(payload.email || payload.customer?.email || "").trim();
  if (email) order.customerEmail = email;

  const name = customerNameFromPayload(payload);
  if (name && name !== "Shopify customer") order.customerName = name;

  if (payload.total_price != null) {
    order.totalCents = dollarsToCents(payload.total_price);
  }
  if (payload.subtotal_price != null) {
    order.subtotalCents = dollarsToCents(payload.subtotal_price);
  }
  if (payload.currency) order.currency = String(payload.currency);

  if (payload.fulfillment_status !== undefined) {
    order.fulfillmentStatus = mapFulfillmentStatus(payload.fulfillment_status);
  }

  let inventoryUpdated = false;
  if (nextPayment === "paid" && !wasPaid) {
    order.paymentStatus = "paid";
    order.paidAt = now;
    decrementInventoryForOrder(store, order);
    inventoryUpdated = true;
  } else if (!wasPaid) {
    order.paymentStatus = nextPayment;
  } else if (nextPayment === "refunded" || nextPayment === "cancelled") {
    order.paymentStatus = nextPayment;
  }

  order.updatedAt = now;
  return { order, inventoryUpdated, created };
}

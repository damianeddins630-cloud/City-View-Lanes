import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { ShopifyApiError, ShopifyConfigError } from "@/lib/shopify/client";
import { createShopifyDraftOrder } from "@/lib/shopify/draftOrder";
import type { ShopOrder, ShopOrderLineItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type CartLineBody = {
  productId?: string;
  quantity?: number;
};

function parseLines(body: unknown): Array<{ productId: string; quantity: number }> {
  const raw =
    body && typeof body === "object" && "items" in body
      ? (body as { items: unknown }).items
      : body && typeof body === "object" && "lines" in body
        ? (body as { lines: unknown }).lines
        : null;

  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Cart is empty. Add products before checkout.");
  }

  const lines: Array<{ productId: string; quantity: number }> = [];
  for (const row of raw as CartLineBody[]) {
    const productId = String(row?.productId || "").trim();
    const quantity = Math.floor(Number(row?.quantity));
    if (!productId) throw new Error("Each cart item needs a product id.");
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error("Each cart item needs a quantity of 1 or more.");
    }
    const existing = lines.find((l) => l.productId === productId);
    if (existing) existing.quantity += quantity;
    else lines.push({ productId, quantity });
  }
  return lines;
}

function buildOrderLines(
  storeProducts: Awaited<ReturnType<typeof readStore>>["products"],
  requested: Array<{ productId: string; quantity: number }>,
): { lineItems: ShopOrderLineItem[]; subtotalCents: number } {
  const lineItems: ShopOrderLineItem[] = [];
  let subtotalCents = 0;

  for (const line of requested) {
    const product = storeProducts.find((p) => p.id === line.productId);
    if (!product || !product.active) {
      throw new Error(
        "A product in your cart is no longer available. Refresh and try again.",
      );
    }
    if (product.inventory < line.quantity) {
      throw new Error(
        `Not enough inventory for “${product.name}”. Only ${product.inventory} available.`,
      );
    }
    lineItems.push({
      productId: product.id,
      name: product.name,
      quantity: line.quantity,
      unitPriceCents: product.priceCents,
      imageUrl: product.imageUrl || undefined,
    });
    subtotalCents += product.priceCents * line.quantity;
  }

  return { lineItems, subtotalCents };
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const requested = parseLines(body);
    const email =
      body && typeof body === "object" && "email" in body
        ? String((body as { email?: string }).email || "")
            .trim()
            .toLowerCase()
        : "";
    const customerName =
      body && typeof body === "object" && "customerName" in body
        ? String((body as { customerName?: string }).customerName || "").trim()
        : "";

    const store = await readStore();
    const { lineItems, subtotalCents } = buildOrderLines(store.products, requested);

    const now = new Date().toISOString();
    const websiteOrderId = makeId("ord");
    const pendingOrder: ShopOrder = {
      id: websiteOrderId,
      customerName: customerName || "Checkout customer",
      customerEmail: email,
      lineItems,
      subtotalCents,
      totalCents: subtotalCents,
      currency: "USD",
      paymentStatus: "pending",
      fulfillmentStatus: "unfulfilled",
      createdAt: now,
      updatedAt: now,
    };

    await updateStore((s) => {
      // Re-check inventory under write lock to reduce oversell races.
      buildOrderLines(s.products, requested);
      s.shopOrders.unshift({ ...pendingOrder });
    });

    let checkoutUrl = "";
    let shopifyDraftOrderId = "";

    try {
      const draft = await createShopifyDraftOrder({
        websiteOrderId,
        customerEmail: email || undefined,
        lines: lineItems.map((item) => ({
          productId: item.productId,
          title: item.name,
          quantity: item.quantity,
          priceCents: item.unitPriceCents,
        })),
        note: `Ballard's Pro Shop order ${websiteOrderId}${
          customerName ? ` · ${customerName}` : ""
        }`,
      });
      checkoutUrl = draft.invoiceUrl;
      shopifyDraftOrderId = draft.id;
    } catch (error) {
      await updateStore((s) => {
        const order = s.shopOrders.find((o) => o.id === websiteOrderId);
        if (order) {
          order.paymentStatus = "failed";
          order.updatedAt = new Date().toISOString();
        }
      });
      throw error;
    }

    await updateStore((s) => {
      const order = s.shopOrders.find((o) => o.id === websiteOrderId);
      if (order) {
        order.shopifyDraftOrderId = shopifyDraftOrderId;
        order.shopifyCheckoutUrl = checkoutUrl;
        order.updatedAt = new Date().toISOString();
      }
    });

    return NextResponse.json({
      ok: true,
      orderId: websiteOrderId,
      checkoutUrl,
      shopifyDraftOrderId,
    });
  } catch (error) {
    if (error instanceof ShopifyConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof ShopifyApiError) {
      return NextResponse.json(
        {
          error:
            "Could not start Shopify checkout. Please try again in a moment.",
          detail: error.message,
        },
        { status: 502 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Checkout failed.";
    const status =
      /inventory|available|empty|quantity|product|cart/i.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

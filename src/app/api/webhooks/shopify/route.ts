import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateStore } from "@/lib/db";
import { ShopifyConfigError } from "@/lib/shopify/config";
import {
  applyShopifyOrderToStore,
  type ShopifyOrderPayload,
} from "@/lib/shopify/orders";
import { verifyShopifyWebhookHmac } from "@/lib/shopify/webhook";

export const dynamic = "force-dynamic";

/**
 * Shopify webhook endpoint.
 * Configure in Shopify Admin / app:
 *   orders/paid
 *   orders/updated  (optional — syncs fulfillment)
 * URL: https://<site>/api/webhooks/shopify
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const topic = (request.headers.get("x-shopify-topic") || "").toLowerCase();

  try {
    if (!verifyShopifyWebhookHmac(rawBody, hmac)) {
      return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
    }
  } catch (error) {
    if (error instanceof ShopifyConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 500 });
  }

  let payload: ShopifyOrderPayload;
  try {
    payload = JSON.parse(rawBody) as ShopifyOrderPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Acknowledge unsupported topics quickly (still verified).
  if (
    topic &&
    topic !== "orders/paid" &&
    topic !== "orders/create" &&
    topic !== "orders/updated" &&
    topic !== "orders/fulfilled" &&
    topic !== "orders/partially_fulfilled"
  ) {
    return NextResponse.json({ ok: true, ignored: true, topic });
  }

  try {
    if (payload.id == null && !topic) {
      return NextResponse.json({ error: "Empty webhook payload." }, { status: 400 });
    }

    const forcePaid = topic === "orders/paid";
    const appliedBox: {
      current: ReturnType<typeof applyShopifyOrderToStore> | null;
    } = { current: null };

    await updateStore((store) => {
      appliedBox.current = applyShopifyOrderToStore(store, payload, { forcePaid });
    });

    const applied = appliedBox.current;
    if (!applied) {
      return NextResponse.json({ error: "Order was not applied." }, { status: 500 });
    }

    if (applied.inventoryUpdated || applied.order.paymentStatus === "paid") {
      revalidatePath("/pro-shop");
      revalidatePath("/admin");
    }

    return NextResponse.json({
      ok: true,
      topic: topic || null,
      orderId: applied.order.id,
      paymentStatus: applied.order.paymentStatus,
      fulfillmentStatus: applied.order.fulfillmentStatus,
      inventoryUpdated: applied.inventoryUpdated,
      created: applied.created,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

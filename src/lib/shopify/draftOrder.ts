import { centsToInputValue } from "@/lib/money";
import { getShopifyConfig } from "./config";
import { shopifyAdminFetch } from "./client";

export type DraftOrderLineInput = {
  productId: string;
  title: string;
  quantity: number;
  priceCents: number;
};

export type CreatedDraftOrder = {
  id: string;
  invoiceUrl: string;
  name?: string;
  totalPrice?: string;
};

type ShopifyDraftOrderResponse = {
  draft_order?: {
    id?: number | string;
    name?: string;
    invoice_url?: string | null;
    total_price?: string;
  };
};

export async function createShopifyDraftOrder(input: {
  websiteOrderId: string;
  lines: DraftOrderLineInput[];
  note?: string;
  customerEmail?: string;
}): Promise<CreatedDraftOrder> {
  if (!input.lines.length) {
    throw new Error("Draft order requires at least one line item.");
  }

  const config = getShopifyConfig();
  const line_items = input.lines.map((line) => ({
    title: line.title,
    price: centsToInputValue(line.priceCents),
    quantity: line.quantity,
    taxable: true,
    requires_shipping: true,
    sku: line.productId,
    properties: [
      { name: "_website_product_id", value: line.productId },
      { name: "_website_order_id", value: input.websiteOrderId },
    ],
  }));

  const draft_order: Record<string, unknown> = {
    line_items,
    note:
      input.note ||
      `Ballard's Pro Shop website order ${input.websiteOrderId}` +
        (config.siteUrl ? ` · ${config.siteUrl}` : ""),
    tags: "website-pro-shop,ballards-academy",
    note_attributes: [
      { name: "website_order_id", value: input.websiteOrderId },
      { name: "source", value: "cityview-pro-shop" },
    ],
  };

  if (input.customerEmail) {
    draft_order.email = input.customerEmail;
  }

  const data = await shopifyAdminFetch<ShopifyDraftOrderResponse>({
    method: "POST",
    path: "/draft_orders.json",
    body: { draft_order },
  });

  const draft = data.draft_order;
  const id = draft?.id != null ? String(draft.id) : "";
  const invoiceUrl = (draft?.invoice_url || "").trim();

  if (!id) {
    throw new Error("Shopify did not return a draft order id.");
  }
  if (!invoiceUrl) {
    throw new Error(
      "Shopify did not return a checkout URL for this draft order. Check Draft Orders permissions on the Shopify app.",
    );
  }

  return {
    id,
    invoiceUrl,
    name: draft?.name,
    totalPrice: draft?.total_price,
  };
}

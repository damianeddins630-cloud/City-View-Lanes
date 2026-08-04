import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Product, ShopOrder, Store } from "@/lib/types";
import {
  applyShopifyOrderToStore,
  extractWebsiteOrderId,
  type ShopifyOrderPayload,
} from "./orders";

function baseStore(overrides?: Partial<Store>): Store {
  const product: Product = {
    id: "prod_ball_1",
    name: "Test Ball",
    description: "Demo",
    priceCents: 1000,
    inventory: 5,
    categoryId: "",
    imageUrl: "",
    imageAlt: "Test Ball",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  const pending: ShopOrder = {
    id: "ord_website_1",
    shopifyDraftOrderId: "111",
    customerName: "Checkout customer",
    customerEmail: "",
    lineItems: [
      {
        productId: "prod_ball_1",
        name: "Test Ball",
        quantity: 2,
        unitPriceCents: 1000,
      },
    ],
    subtotalCents: 2000,
    totalCents: 2000,
    currency: "USD",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  return {
    users: [],
    roles: [],
    leagues: [],
    leagueSignups: [],
    bookings: [],
    employmentApplications: [],
    hours: [],
    chatMessages: [],
    notifications: [],
    siteContent: {} as Store["siteContent"],
    productCategories: [],
    products: [product],
    shopOrders: [pending],
    ...overrides,
  };
}

describe("Shopify order mapping", () => {
  it("extracts website order id from note attributes", () => {
    const payload: ShopifyOrderPayload = {
      note_attributes: [{ name: "website_order_id", value: "ord_website_1" }],
    };
    assert.equal(extractWebsiteOrderId(payload), "ord_website_1");
  });

  it("marks paid, saves customer, and decrements inventory once", () => {
    const store = baseStore();
    const payload: ShopifyOrderPayload = {
      id: 555001,
      email: "bowler@example.com",
      financial_status: "paid",
      fulfillment_status: null,
      total_price: "21.50",
      subtotal_price: "20.00",
      currency: "USD",
      note_attributes: [{ name: "website_order_id", value: "ord_website_1" }],
      customer: { first_name: "Alex", last_name: "Lane", email: "bowler@example.com" },
      line_items: [
        {
          title: "Test Ball",
          quantity: 2,
          price: "10.00",
          sku: "prod_ball_1",
          properties: [
            { name: "_website_product_id", value: "prod_ball_1" },
            { name: "_website_order_id", value: "ord_website_1" },
          ],
        },
      ],
    };

    const first = applyShopifyOrderToStore(store, payload, { forcePaid: true });
    assert.equal(first.inventoryUpdated, true);
    assert.equal(first.order.paymentStatus, "paid");
    assert.equal(first.order.customerEmail, "bowler@example.com");
    assert.equal(first.order.customerName, "Alex Lane");
    assert.equal(first.order.shopifyOrderId, "555001");
    assert.equal(first.order.totalCents, 2150);
    assert.equal(store.products[0].inventory, 3);

    const second = applyShopifyOrderToStore(store, payload, { forcePaid: true });
    assert.equal(second.inventoryUpdated, false);
    assert.equal(store.products[0].inventory, 3);
  });

  it("does not decrement inventory for pending financial status", () => {
    const store = baseStore();
    const payload: ShopifyOrderPayload = {
      id: 555002,
      financial_status: "pending",
      note_attributes: [{ name: "website_order_id", value: "ord_website_1" }],
      line_items: [],
    };
    const result = applyShopifyOrderToStore(store, payload);
    assert.equal(result.inventoryUpdated, false);
    assert.equal(result.order.paymentStatus, "pending");
    assert.equal(store.products[0].inventory, 5);
  });
});

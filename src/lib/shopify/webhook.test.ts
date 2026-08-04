import assert from "node:assert/strict";
import crypto from "node:crypto";
import { describe, it, before, after } from "node:test";
import { verifyShopifyWebhookHmac } from "./webhook";

describe("Shopify webhook HMAC", () => {
  const secret = "test_webhook_secret_123";
  const body = '{"id":99,"financial_status":"paid"}';

  before(() => {
    process.env.SHOPIFY_WEBHOOK_SECRET = secret;
  });

  after(() => {
    delete process.env.SHOPIFY_WEBHOOK_SECRET;
    delete process.env.SHOPIFY_API_SECRET;
  });

  it("accepts a valid signature", () => {
    const hmac = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
    assert.equal(verifyShopifyWebhookHmac(body, hmac), true);
  });

  it("rejects an invalid signature", () => {
    assert.equal(verifyShopifyWebhookHmac(body, "not-a-valid-hmac"), false);
  });

  it("rejects a missing header", () => {
    assert.equal(verifyShopifyWebhookHmac(body, null), false);
  });
});

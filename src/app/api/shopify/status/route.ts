import { NextResponse } from "next/server";
import { getShopifyConfig, getShopifyWebhookSecret } from "@/lib/shopify/config";

export const dynamic = "force-dynamic";

/**
 * Safe config check for testing. Never returns secrets.
 * GET /api/shopify/status
 */
export async function GET() {
  let checkoutConfigured = false;
  let checkoutError = "";
  try {
    const config = getShopifyConfig();
    checkoutConfigured = Boolean(
      config.storeDomain && config.adminAccessToken && config.apiVersion,
    );
  } catch (error) {
    checkoutError =
      error instanceof Error ? error.message : "Shopify checkout is not configured.";
  }

  let webhookConfigured = false;
  let webhookError = "";
  try {
    getShopifyWebhookSecret();
    webhookConfigured = true;
  } catch (error) {
    webhookError =
      error instanceof Error ? error.message : "Webhook secret is not configured.";
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    ""
  ).trim();

  return NextResponse.json({
    ok: checkoutConfigured,
    checkoutConfigured,
    webhookConfigured,
    siteUrl: siteUrl || null,
    storeDomain: checkoutConfigured
      ? (process.env.SHOPIFY_STORE_DOMAIN || "")
          .replace(/^https?:\/\//i, "")
          .replace(/\/$/, "")
      : null,
    apiVersion: process.env.SHOPIFY_API_VERSION || "2025-01",
    errors: {
      checkout: checkoutError || null,
      webhook: webhookError || null,
    },
    webhookUrl: siteUrl
      ? `${siteUrl.replace(/\/$/, "")}/api/webhooks/shopify`
      : "/api/webhooks/shopify",
  });
}

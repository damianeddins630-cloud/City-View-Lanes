export type ShopifyConfig = {
  storeDomain: string;
  adminAccessToken: string;
  apiVersion: string;
  siteUrl: string;
};

export class ShopifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyConfigError";
  }
}

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

/** Server-only Shopify env. Never import from client components. */
export function getShopifyConfig(): ShopifyConfig {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN
    ? normalizeDomain(process.env.SHOPIFY_STORE_DOMAIN)
    : "";
  const adminAccessToken = (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "").trim();
  const apiVersion = (process.env.SHOPIFY_API_VERSION || "2025-01").trim();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");

  const missing: string[] = [];
  if (!storeDomain) missing.push("SHOPIFY_STORE_DOMAIN");
  if (!adminAccessToken) missing.push("SHOPIFY_ADMIN_ACCESS_TOKEN");
  if (!apiVersion) missing.push("SHOPIFY_API_VERSION");

  if (missing.length) {
    throw new ShopifyConfigError(
      `Shopify checkout is not configured. Missing: ${missing.join(", ")}.`,
    );
  }

  return { storeDomain, adminAccessToken, apiVersion, siteUrl };
}

export function isShopifyConfigured(): boolean {
  try {
    getShopifyConfig();
    return true;
  } catch {
    return false;
  }
}

import { getShopifyConfig, ShopifyConfigError } from "./config";

export class ShopifyApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ShopifyApiError";
    this.status = status;
    this.details = details;
  }
}

type ShopifyFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
};

/**
 * Call Shopify Admin REST API. Server-side only — uses SHOPIFY_ADMIN_ACCESS_TOKEN.
 */
export async function shopifyAdminFetch<T>(options: ShopifyFetchOptions): Promise<T> {
  const config = getShopifyConfig();
  const path = options.path.startsWith("/") ? options.path : `/${options.path}`;
  const url = `https://${config.storeDomain}/admin/api/${config.apiVersion}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Shopify-Access-Token": config.adminAccessToken,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network error talking to Shopify.";
    throw new ShopifyApiError(`Shopify request failed: ${message}`, 502);
  }

  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = { raw: text };
    }
  }

  if (!response.ok) {
    const errors =
      json && typeof json === "object" && "errors" in json
        ? (json as { errors: unknown }).errors
        : json;
    const summary =
      typeof errors === "string"
        ? errors
        : errors
          ? JSON.stringify(errors)
          : response.statusText || "Unknown Shopify error";
    throw new ShopifyApiError(
      `Shopify API error (${response.status}): ${summary}`,
      response.status,
      errors,
    );
  }

  return json as T;
}

export { ShopifyConfigError };

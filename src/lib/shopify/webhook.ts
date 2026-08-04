import crypto from "crypto";
import { getShopifyWebhookSecret } from "./config";

export function verifyShopifyWebhookHmac(
  rawBody: string,
  hmacHeader: string | null,
): boolean {
  if (!hmacHeader) return false;
  const secret = getShopifyWebhookSecret();
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

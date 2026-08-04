# Shopify Checkout Integration

Ballard's Bowling Academy / CityView Pro Shop uses **this website as the source of truth** for products, prices, inventory, categories, and images. **Shopify is only the payment and checkout provider.**

Do **not** manage day-to-day products inside Shopify Admin. Employees should use the website Admin → **Products** tab.

---

## Architecture

```
Browse /pro-shop (website catalog)
  → Add to cart (website localStorage)
  → POST /api/checkout (server)
      • load products from website store
      • validate prices + inventory
      • create Shopify Draft Order (custom line items)
      • save pending website order
  → Redirect to Shopify invoice / checkout URL
  → Customer pays (card, Shop Pay, Apple Pay, Google Pay)
  → Shopify webhook → POST /api/webhooks/shopify
      • verify HMAC
      • mark website order paid
      • decrement website inventory (once)
  → Admin → Orders stays in sync
```

| Responsibility | Owner |
|----------------|--------|
| Products, names, descriptions, prices, inventory, categories, images | **Website** |
| Secure checkout, payments, taxes, shipping, paid order records | **Shopify** |

---

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production / Preview as needed). Never commit real secrets to GitHub.

| Variable | Required | Purpose |
|----------|----------|---------|
| `SHOPIFY_STORE_DOMAIN` | Yes | e.g. `ballards-bowling.myshopify.com` |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Yes | Admin API access token (server-side only) |
| `SHOPIFY_API_VERSION` | Yes | `2025-01` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL, e.g. `https://pro-shop-lemon.vercel.app` |
| `SHOPIFY_WEBHOOK_SECRET` | Yes (for webhooks) | Shopify **app client secret** used for HMAC verification |
| `SITE_URL` | Recommended | Same site URL for server-side links / local dev |
| `AUTH_SECRET` | Yes | Existing site auth |
| `BLOB_STORE_ID` / `BLOB_READ_WRITE_TOKEN` | Yes on Vercel | Durable product/order storage |

Optional alias: `SHOPIFY_API_SECRET` is accepted if `SHOPIFY_WEBHOOK_SECRET` is unset (same client secret).

### Security rules

- All Shopify Admin API calls run **only** in server routes under `src/lib/shopify/` and `src/app/api/`.
- `SHOPIFY_ADMIN_ACCESS_TOKEN` must never appear in client components or GitHub.
- Rotate any token that was pasted into chat, email, or tickets.

---

## Shopify app setup

1. In Shopify Partner Dashboard / Admin, open the custom app for this store.
2. Enable Admin API scopes at minimum:
   - **Draft orders** — write (create checkout)
   - **Orders** — read (optional, helpful for support)
3. Install the app on `ballards-bowling.myshopify.com` and copy the Admin API access token into Vercel as `SHOPIFY_ADMIN_ACCESS_TOKEN`.
4. Copy the app **Client secret** into Vercel as `SHOPIFY_WEBHOOK_SECRET`.
5. Redeploy the Vercel project after saving env vars.

### Webhooks

Create HTTPS webhooks pointing to:

```text
https://pro-shop-lemon.vercel.app/api/webhooks/shopify
```

| Topic | Required | Effect |
|-------|----------|--------|
| `orders/paid` | **Yes** | Marks website order paid; decrements inventory once |
| `orders/updated` | Recommended | Syncs fulfillment / totals |
| `orders/create` | Optional | Creates/links order early if needed |
| `orders/fulfilled` | Optional | Updates fulfillment status |

Webhook HMAC is verified with `X-Shopify-Hmac-Sha256` against the raw body.

---

## Website Admin

### Products (`manage_products`)

Admin → **Products**

- Add / edit / remove products
- Name, description, price, inventory, category, active flag
- Upload / replace / remove images via the website storage system (not Shopify)

### Orders (`manage_orders`)

Admin → **Orders**

Shows:

- Order ID (website)
- Customer name + email
- Products purchased + quantities
- Total amount
- Payment status
- Fulfillment status (editable)
- Order / paid date
- Shopify draft + order ids in the detail view

---

## Checkout process (runtime)

1. Customer opens `/pro-shop` and sees **active** website products only.
2. Cart stores `{ productId, quantity }` in browser `localStorage`.
3. **Checkout securely** calls `POST /api/checkout` with those lines.
4. Server reloads website products and rejects:
   - missing env / Shopify config
   - inactive / missing products
   - quantity above inventory
   - Shopify API failures
5. Server creates a Shopify **Draft Order** with **custom line items** (title, price, qty). No Shopify product catalog is used.
6. Draft order includes `note_attributes.website_order_id` and line properties for matching.
7. Browser redirects to Shopify `invoice_url`.
8. Customer completes payment on Shopify (taxes/shipping calculated there).

---

## Webhook process (runtime)

1. Shopify sends `orders/paid` (or related topics) to `/api/webhooks/shopify`.
2. Server verifies HMAC; invalid signatures return `401`.
3. Payload is matched to a website order by:
   - `note_attributes.website_order_id`, or
   - line property `_website_order_id`, or
   - order id found in the note, or
   - existing `shopifyOrderId`
4. On first transition to **paid**:
   - update payment status + `paidAt`
   - save customer name/email/totals from Shopify
   - decrement website product inventory once (idempotent on duplicate webhooks)
5. Admin → Orders reflects the update.

---

## How to test an order

### A. Automated smoke tests (repo)

```bash
npm install
npm run test:shopify
npm run build
```

These cover money helpers, cart inventory logic, webhook HMAC verification, and order/inventory apply logic (no live Shopify calls).

### Quick config check (after deploy)

Open:

```text
https://<your-city-view-lanes-domain>/api/shopify/status
```

You should see `checkoutConfigured: true`. `webhookConfigured` should be `true` once `SHOPIFY_WEBHOOK_SECRET` is set. This endpoint never returns secrets.

### B. End-to-end on production / preview

1. Confirm Vercel env vars are set and the latest deploy includes this branch.
2. Log into website Admin → **Products**.
3. Add a low-priced **test** product (e.g. $1.00) with inventory ≥ 1, image optional, **Active** checked.
4. Open `/pro-shop` → **Shop gear** → Add to cart → **Checkout securely**.
5. You should land on Shopify checkout for store `ballards-bowling.myshopify.com`.
6. Complete payment with Shopify Bogus Gateway / test mode if enabled, or a real small charge you can refund.
7. In Shopify Admin, confirm the order exists and is paid.
8. On the website:
   - Admin → **Orders** shows Paid + customer + line items
   - Product inventory decreased by the purchased quantity
9. Send a duplicate `orders/paid` webhook (Shopify “Send test notification” if available) — inventory must **not** decrease again.

### C. Failure checks

| Scenario | Expected |
|----------|----------|
| Missing Shopify env vars | Checkout returns clear 503 error; cart remains usable |
| Quantity above stock | Checkout blocked with inventory message |
| Bad webhook HMAC | `401 Invalid HMAC` |
| Draft Order API error | Website order marked `failed`; friendly error to customer |

---

## Key files

| Path | Role |
|------|------|
| `src/lib/shopify/config.ts` | Env loading |
| `src/lib/shopify/client.ts` | Admin REST client (server) |
| `src/lib/shopify/draftOrder.ts` | Draft Order create |
| `src/lib/shopify/webhook.ts` | HMAC verify |
| `src/lib/shopify/orders.ts` | Map Shopify payload → website order + inventory |
| `src/app/api/checkout/route.ts` | Cart → Draft Order → checkout URL |
| `src/app/api/webhooks/shopify/route.ts` | Paid order webhook |
| `src/app/api/admin/products/route.ts` | Product CRUD |
| `src/app/api/admin/orders/route.ts` | Orders list / fulfillment |
| `src/components/shop/ProShopStorefront.tsx` | Catalog + cart UI |
| `src/components/AdminProductsPanel.tsx` | Admin products |
| `src/components/AdminOrdersPanel.tsx` | Admin orders |

---

## Local development

1. Copy `.env.example` → `.env.local` and fill Shopify + Blob + `AUTH_SECRET` values.
2. `npm run dev`
3. Use a tunnel (e.g. Cloudflare Tunnel / ngrok) if you need Shopify webhooks to hit localhost.
4. Point webhook URL at `https://<tunnel>/api/webhooks/shopify`.

---

## Support notes

- Abandoned Shopify checkouts leave a website order in `pending` or `failed` — inventory is unchanged until paid.
- Refunds: webhook mapping can set payment status to `refunded`; restocking is not automatic in v1 (adjust inventory in Admin → Products if needed).
- If checkout redirects fail, check Vercel function logs for `Shopify API error` details (never log the access token).

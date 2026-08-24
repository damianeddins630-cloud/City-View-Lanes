# Neon Postgres

This project can connect to a Neon Postgres database for future durable data work.

**Today the live site still uses Vercel Blob JSON** (`src/lib/db.ts`) as the main store. Neon is wired as a connection + health check so you can add tables safely without putting secrets in GitHub.

## Security

- Never commit `DATABASE_URL`, passwords, or Neon connection strings.
- If a password was pasted into chat, email, or a ticket: **rotate it in Neon** immediately.
- Store secrets only in:
  - Vercel → Project → Settings → Environment Variables
  - Local `.env.local` (gitignored)

## Recommended Vercel variables

| Name | Required | Notes |
|------|----------|--------|
| `DATABASE_URL` | Yes | Pooled connection (pgbouncer) — use this on Vercel |
| `DATABASE_URL_UNPOOLED` | Optional | Direct / migrations |
| `POSTGRES_URL` | Optional | Neon/Vercel template alias |
| `POSTGRES_URL_NON_POOLING` | Optional | Neon/Vercel template alias |
| `POSTGRES_PRISMA_URL` | Optional | If you add Prisma later |

Enable Production + Preview + Development, then redeploy.

## Verify

After deploy:

```text
https://<your-domain>/api/db/status
```

Expected when connected:

```json
{ "ok": true, "configured": true, "database": "neondb", "latencyMs": 12 }
```

This endpoint never returns passwords or full connection strings.

## Code

| File | Role |
|------|------|
| `src/lib/neon.ts` | Server-only Neon SQL helper |
| `src/app/api/db/status/route.ts` | Health check |

Import and use only from server routes / server components:

```ts
import { sql } from "@/lib/neon";

const rows = await sql`select 1 as ok`;
```

## Next steps (optional)

If you want the website store (users, products, orders, etc.) moved off Blob JSON onto Neon, say so and we can plan a migration. That is a separate, larger change.

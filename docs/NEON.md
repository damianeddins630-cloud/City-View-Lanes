# Neon Postgres (primary store)

When `DATABASE_URL` (or `POSTGRES_URL`) is set, **Neon is the primary durable store** for the whole website JSON store (users, hours, leagues, products, orders, content). Vercel Blob becomes optional (useful for image uploads).

## Security

- Never commit `DATABASE_URL`, passwords, or Neon connection strings.
- If a password was pasted into chat: **rotate it in Neon** after deploy, then update Vercel env vars.
- Store secrets only in:
  - Vercel → Project → Settings → Environment Variables
  - Local `.env.local` (gitignored)

## Required Vercel variables

| Name | Required | Notes |
|------|----------|--------|
| `DATABASE_URL` | Yes | Pooled connection (pgbouncer) — use this on Vercel |
| `DATABASE_URL_UNPOOLED` | Optional | Direct / migrations |

Enable Production + Preview + Development, then redeploy.

## How it works

1. Table `cityview_store` holds one JSON document (`id = cityview`).
2. First read seeds Neon from Blob / seed file if empty.
3. Writes go to Neon first; Blob/GitHub remain optional backups when configured.

## Verify

```text
https://<your-domain>/api/db/status
https://<your-domain>/api/storage
```

Expected:

```json
{ "ok": true, "configured": true, "database": "neondb" }
```

```json
{ "persistence": "neon", "durable": true }
```

Admin → **Test save now** probes Neon write + read.

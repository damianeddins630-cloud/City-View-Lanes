<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single Next.js 16 (Turbopack) app; there is no separate backend/DB service. Standard commands live in `package.json`: `npm run dev` (port 3000), `npm run lint`, `npm run build`.

Local persistence gotcha: with no `BLOB_READ_WRITE_TOKEN`/`GITHUB_TOKEN` and not running on Vercel, `src/lib/db.ts` persists to the tracked seed file `data/store.json`. Any create/edit done while testing (leagues, hours, profiles, signups) is written back to that file, so run `git checkout -- data/store.json` before committing to avoid committing test data.

Master admin login: username `masteradmin`, password `CityView#Master2026!` (see README). The login API (`/api/auth/login`) expects an `identifier` field (username or email), not `username`.

`AUTH_SECRET` has a dev fallback, so `.env.local` is optional locally; the Vercel-only Blob/GitHub storage env vars are not needed for local dev.

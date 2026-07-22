# AI-FOS — Deployment Guide

This guide takes AI-FOS from a fresh clone to a live, demo-ready deployment.
The app is a **Next.js 14** application (frontend + API routes) backed by
**PostgreSQL** (via Prisma) and **Redis** (orchestrator cache/memory), with
**Claude (Anthropic)** powering the LangChain orchestrator and agents.

Recommended topology:

- **Frontend + API → Vercel**
- **PostgreSQL + Redis → Render** (managed, free tier)

You can also run the entire app on Render (see `render.yaml`, topology B).

---

## 1. Environment variables

Copy `.env.example` → `.env` and fill in the values. Every variable:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (`postgresql://user:pass@host:5432/db?schema=public`). On managed hosts add `?sslmode=require`. |
| `AUTH_SECRET` | ✅ | Encrypts NextAuth session JWTs. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_URL` | ✅ (prod) | Canonical app URL, e.g. `https://your-app.vercel.app`. `http://localhost:3000` in dev. |
| `AUTH_TRUST_HOST` | ✅ | Set to `true` (required behind Vercel/Render proxies). |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key — **required** to enable the AI Orchestrator & agents. Without it the AI panels render a clear "AI offline" state. |
| `ANTHROPIC_MODEL` | ⬜ | Defaults to `claude-opus-4-8`. |
| `REDIS_URL` | ⬜ | Redis connection string. If unset, the app transparently falls back to an in-process cache (fine for a single instance / demo). |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | ⬜ | Enables Google OAuth login. Credentials (email/password) login works without them. |

---

## 2. Local development

Prerequisites: Node 18+, and Docker (for local Postgres + Redis).

```bash
# 1. Install deps (runs `prisma generate` automatically via postinstall)
npm install

# 2. Start Postgres + Redis
docker compose up -d

# 3. Point .env at the local DB (matches docker-compose.yml)
#    DATABASE_URL="postgresql://aifos:aifos_local_dev@localhost:5432/aifos?schema=public"
#    REDIS_URL="redis://localhost:6379"

# 4. Push the Prisma schema and seed the demo account
npm run db:setup

# 5. Run
npm run dev        # http://localhost:3000
```

**Demo login:** `demo@aifos.local` / `demo12345` (created by the seed, with 12 realistic transactions).

> No Docker? Use a free cloud Postgres (Neon / Supabase / Render) and set
> `DATABASE_URL` to its connection string, then run `npm run db:setup`.

---

## 3. Provision data on Render (PostgreSQL + Redis)

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo. Render reads
   `render.yaml` and creates `aifos-postgres` (PostgreSQL) and `aifos-redis`.
3. After creation, open each resource and copy:
   - **Postgres → "External Connection String"** → this is your `DATABASE_URL`
     (append `?sslmode=require` if not present).
   - **Redis → "Internal/External Connection String"** → your `REDIS_URL`.

> Free-tier Render Postgres works for demos. Redis is optional — omit
> `REDIS_URL` and the app uses its in-memory fallback.

---

## 4. Deploy the app to Vercel

1. Vercel → **Add New → Project** → import the GitHub repo. Framework is
   auto-detected as **Next.js**. `vercel.json` sets the build command to
   `prisma generate && next build`.
2. **Project → Settings → Environment Variables** — add (Production + Preview):
   - `DATABASE_URL` = Render Postgres string (with `?sslmode=require`)
   - `REDIS_URL` = Render Redis string *(optional)*
   - `AUTH_SECRET` = generated secret
   - `AUTH_URL` = `https://<your-project>.vercel.app`
   - `AUTH_TRUST_HOST` = `true`
   - `ANTHROPIC_API_KEY` = your Claude key
   - `ANTHROPIC_MODEL` = `claude-opus-4-8`
   - *(optional)* `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
3. **Deploy.**

### One-time DB initialization against production

Prisma needs the schema pushed and (optionally) the demo data seeded on the
production database. Run locally with the **production** `DATABASE_URL`:

```bash
# From your machine, pointing at the Render Postgres URL:
DATABASE_URL="postgresql://...render.../aifos?sslmode=require" npm run db:setup
```

This runs `prisma db push` + the seed. Re-running is idempotent.

---

## 5. Deploy everything to Render (alternative)

`render.yaml` also defines an `aifos-web` Node web service. To use it, keep that
block, deploy the Blueprint, then set `AUTH_URL`, `ANTHROPIC_API_KEY` (and
optional Google keys) in the service's Environment tab. `DATABASE_URL`,
`REDIS_URL`, and `AUTH_SECRET` are wired automatically. Run the one-time
`npm run db:setup` against the DB as in step 4.

---

## 6. Post-deploy smoke test

1. Visit the deployed URL → redirected to `/login`.
2. Sign up a new account, or use the seeded `demo@aifos.local` / `demo12345`.
3. Dashboard loads with real transactions, category breakdown, and the AI
   Orchestrator briefing (requires `ANTHROPIC_API_KEY`).
4. Upload a CSV/PDF bank statement on the dashboard → transactions ingest.
5. Visit **Investments** and **Taxes** (Should-tier agents) and **AI Summary**.

---

## Troubleshooting

- **`PrismaClientInitializationError` at runtime** → `DATABASE_URL` unreachable
  or missing `?sslmode=require` on managed Postgres.
- **AI panels show "AI Orchestrator is offline"** → `ANTHROPIC_API_KEY` not set.
- **`AUTH_URL`/redirect issues** → ensure `AUTH_URL` matches the deployed origin
  and `AUTH_TRUST_HOST=true`.
- **Stale Prisma client on Vercel** → confirmed handled: build runs
  `prisma generate` and `postinstall` regenerates on install.

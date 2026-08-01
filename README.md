# NightBeam Studio Website

Production-ready website for **NightBeam Studio** — home of *The Birth of
Steve* (v0.4.0, Minecraft 26.1.2/26.2, NeoForge + Fabric, by Mahou).

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript strict
- Tailwind CSS v4, `motion` (Framer Motion), Press Start 2P + Inter
- PostgreSQL + Prisma 6 (with a zero-setup in-memory fallback)
- Auth.js v5 (credentials + Google/Discord/GitHub, env-gated)
- Redis (`ioredis`, in-memory fallback) for caching and rate limiting
- Zod validation, React Query, node-cron workers
- Docker Compose (dev + prod, optional Caddy TLS), GitHub Actions CI

## Build status

The site was built in six phases, each ending with green
`typecheck` + `lint` + `test` + `build` and a commit on `main`:

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Foundation: repo, scaffold, Prisma/Postgres/Redis wiring, Docker, CI, design system, shell layout | done |
| 1 | CurseForge client + cache + sync worker, fallback catalog, homepage hero/stats/featured/membership | done |
| 2 | `/projects` directory (filters, search, URL state, grid/list) + project pages (versions, downloads, gallery) | done |
| 3 | Auth.js credentials + OAuth, verification/reset, rate limiting, dashboard, notifications + digests | done |
| 4 | RBAC admin panel, overrides, announcements, sync/cache controls, self-hosted analytics | done |
| 5 | Accessibility pass, SEO/OG/JSON-LD, Playwright smoke suite, deployment docs | done |

## Architecture

- **Data layer** (`src/lib/db`): a `DataRepo` interface with two backends —
  PostgreSQL via Prisma and a seeded in-memory store. `DATA_BACKEND=auto`
  probes the database and falls back automatically, so the site runs with
  zero external services.
- **CurseForge** (`src/lib/curseforge`): typed API client (server-only),
  Redis + in-memory caching, DB mirror upserts, scheduled sync via
  `src/worker/index.ts`, graceful degradation to the seeded catalog.
- **Auth** (`src/lib/auth`): Auth.js v5 with JWT sessions (30-day remember-me
  vs 7-day soft expiry), credentials + env-gated OAuth, Redis rate limiting,
  Turnstile, email verification/reset, login history, logout-all, RBAC
  permission matrix.
- **Observability**: self-hosted analytics events, API error log, audit log,
  sync state — all visible in the admin panel.

## Quick start (no database required)

```bash
npm install
npm run db:generate
cp .env.example .env
npm run dev
```

With `DATA_BACKEND=auto` (default) and no Postgres running, the site renders
the seeded catalog from memory. Bring up the full stack with:

```bash
docker compose up
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit + integration tests |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:migrate` / `db:deploy` | Prisma migrations (dev / CI) |
| `npm run db:seed` | Seed catalog + bootstrap admin |
| `npm run worker` | CurseForge sync + digest worker |
| `npm run cf:sync` | One-shot CurseForge sync |

## Environment

Copy `.env.example` to `.env`. Every variable is optional; features degrade
gracefully: no CurseForge key → seeded catalog; no SMTP → auto-verified dev
accounts; no OAuth secrets → provider buttons disabled with hints; no Redis →
in-memory cache; no Postgres → in-memory store.

## Deployment

```bash
docker compose -f docker-compose.prod.yml up -d
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Caddy/TLS, backups, and the
env checklist. The site is All Rights Reserved (see LICENSE).

## Tests

- Vitest unit suites: zod schemas, CurseForge mapper fixtures, cache TTLs,
  RBAC matrix, digest builder, URL filter (de)serialization.
- Prisma integration tests run in CI against a real Postgres service.
- Playwright E2E: homepage, directory filters/search, project tabs +
  downloads, register/login/logout, admin gating, cookie consent,
  keyboard-only navigation.

# NightBeam Studio Website — Agent Guide

## Conventions

- TypeScript strict everywhere. Server-only modules (`src/lib/server/*`,
  `src/lib/db/*`, `src/lib/curseforge/*`, `src/lib/auth/*`) must not be
  imported from client components; keep client code to `src/components`
  and `src/app` "use client" files.
- The site must work with zero external services: when `DATABASE_URL` is
  missing or unreachable the data layer falls back to an in-memory catalog
  (`src/lib/db/catalog.ts` + `src/lib/db/memory-store.ts`). Never break
  that fallback.
- Secrets only via environment variables. `.env.example` documents every
  variable; `.env*` is git-ignored.
- CurseForge calls are server-only, cached, and mirrored into the database
  so the site survives outages.
- No AI-generated marketing art. Hero/key visuals are code-native (CSS/Canvas)
  or captured/commissioned assets.
- Commits use conventional style (`feat:`, `chore:`, `fix:`, `docs:`).

## Quality gates (run before committing)

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Docker Compose validation runs in CI (Docker is not installed locally).

## Data & auth

- `npx prisma generate` after schema changes.
- `npm run db:migrate` for local schema dev (needs Postgres).
- `npm run db:seed` seeds the catalog + bootstrap admin (Prisma mode).
- `DATA_BACKEND=memory npm run dev` runs without any database.
- E2E: `npx playwright install chromium && npm run test:e2e` (memory mode).


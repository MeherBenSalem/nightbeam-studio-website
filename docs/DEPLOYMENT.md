# Deployment

The site is designed for a single-node self-hosted stack: `web` (Next.js
standalone), `worker` (scheduled CurseForge sync + digests), PostgreSQL 17,
Redis, and an optional Caddy TLS front.

## Prerequisites

- Docker + Docker Compose plugin on the host
- A domain with an `A` record pointing at the server (for TLS)
- Environment secrets (see checklist below)

## Quick start

```bash
cp .env.example .env
# fill in every value marked REQUIRED
SITE_DOMAIN=mods.example.com docker compose -f docker-compose.prod.yml up -d
```

The `web` service runs `prisma migrate deploy` on start, then serves the
standalone build. The `worker` starts CurseForge sync (per `CRON_SYNC`) and the
notification digest (per `CRON_DIGEST`).

## Environment checklist

| Variable | Required? | Notes |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | yes | used by compose; must match `DATABASE_URL` |
| `DATABASE_URL` | yes | `postgresql://user:pass@postgres:5432/nightbeam?schema=public` |
| `REDIS_URL` | recommended | `redis://redis:6379`; site falls back to memory |
| `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `APP_URL` | yes | public https URL of the site |
| `SITE_DOMAIN` | yes | Caddy virtual host (or `localhost`) |
| `CURSEFORGE_API_KEY` + `CURSEFORGE_AUTHOR_ID` | optional | enables live sync |
| `SMTP_*` + `EMAIL_FROM` | optional | verification/reset/digests; disable `DEV_AUTO_VERIFY` in prod |
| `AUTH_GOOGLE_ID/SECRET`, `AUTH_DISCORD_*`, `AUTH_GITHUB_*` | optional | OAuth providers appear when set |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | optional | bot protection |
| `AUTH_ADMIN_EMAIL` / `AUTH_ADMIN_PASSWORD` | recommended | bootstrap super-admin via `npm run db:seed` |

## TLS with Caddy

Set `SITE_DOMAIN` to the real domain; Caddy obtains and renews Let's Encrypt
certificates automatically. For local testing set `SITE_DOMAIN=localhost`
(self-signed internal cert).

## Backups

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U nightbeam nightbeam > nightbeam-$(date +%F).sql
```

Store dumps off-host and test restores regularly. Redis is append-only
(`--appendonly yes`); its data is a cache and can be rebuilt.

## Updates

```bash
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Migrations run automatically at container start. For zero-downtime deploys,
scale `web` behind your own reverse proxy and drain before swapping.

## Health checks

- Web: `curl -fsS https://$SITE_DOMAIN/`
- Database: `docker compose -f docker-compose.prod.yml exec postgres pg_isready -U nightbeam`
- Sync: sign in as an admin → **Admin → Sync & cache** or `GET /api/sync`

## Security notes

- Secrets live only in `.env`; never commit `.env`.
- Admin/`/dashboard` routes are protected by middleware *and* server-side
  permission checks.
- Rate limits and (optional) Turnstile protect auth endpoints.
- Analytics are self-hosted in the database; no third-party trackers.

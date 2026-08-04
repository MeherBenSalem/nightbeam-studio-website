# Deployment

The site is designed for a single-node self-hosted stack: `web` (Next.js
standalone), `worker` (scheduled CurseForge sync + digests), PostgreSQL 17,
Redis, and an optional Caddy TLS front.

## Prerequisites

- Docker + Docker Compose plugin on the host
- A domain with an `A` record pointing at the server (for TLS)
- Environment secrets (see checklist below)

## Production on this VPS (`nightbeam.dev`)

Live traffic terminates at **nginx** (TLS) → `127.0.0.1:3003` (Docker `web`).
`nightbeam.cloud` currently **301-redirects** to `nightbeam.dev`.

```bash
cd ~/nightbeam-studio-website
sudo docker compose -f docker-compose.prod.yml -f docker-compose.server.yml build web worker
sudo docker compose -f docker-compose.prod.yml -f docker-compose.server.yml up -d web worker
```

`docker-compose.server.yml` maps `3003:3000` and disables the in-compose Caddy
service (nginx already owns 80/443). Security headers/CSP are emitted by Next.js;
nginx on this VPS also sets HSTS and related headers. Caddyfile headers apply only
if you run the Caddy profile.

Stripe webhook URL for production:

```text
https://nightbeam.dev/api/webhooks/stripe
```

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
| `SMTP_*` + `EMAIL_FROM` | optional | verification/reset/digests; **set `DEV_AUTO_VERIFY=false` in production** |
| `AUTH_GOOGLE_ID/SECRET`, `AUTH_DISCORD_*`, `AUTH_GITHUB_*` | optional | OAuth providers appear when set |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | optional | bot protection |
| `AUTH_ADMIN_EMAIL` / `AUTH_ADMIN_PASSWORD` | recommended | bootstrap super-admin via `npm run db:seed` |

| `GOOGLE_SITE_VERIFICATION` | optional | Google Search Console HTML-tag meta content value |

## Google Search Console

1. In [Google Search Console](https://search.google.com/search-console), add the property `https://nightbeam.dev` (production). If you also own `nightbeam.cloud`, add it as a redirect property or leave the existing 301 to `nightbeam.dev`.
2. Choose the **HTML tag** verification method and copy the `content` value from the meta tag (not the full tag).
3. Set `GOOGLE_SITE_VERIFICATION=<content-value>` in `.env`, then redeploy so the meta tag is emitted from `layout.tsx`.
4. Click **Verify** in Search Console.
5. Submit the sitemap: `https://nightbeam.dev/sitemap.xml`.
6. Request indexing for `/` and `/projects` via URL Inspection.

## Stripe Pro membership

Optional. Without `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PRO`, and `STRIPE_WEBHOOK_SECRET`, the membership page shows Pro as unavailable and checkout routes return 503.

| Variable | Required? | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | yes (for Pro) | Stripe secret API key |
| `STRIPE_PRICE_ID_PRO` | yes (for Pro) | recurring price ID for the $3/month Pro plan |
| `STRIPE_WEBHOOK_SECRET` | yes (for Pro) | signing secret from the Stripe webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | client-readable publishable key if needed client-side |

Configure a Stripe webhook endpoint pointing at:

```text
https://your-domain/api/webhooks/stripe
```

Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`.

Also enable the **Customer Portal** in the Stripe Dashboard (Settings → Billing → Customer portal) so “Manage subscription” works. Without it, `/api/stripe/portal` fails.

All three of `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PRO`, and `STRIPE_WEBHOOK_SECRET` must be set; otherwise Pro checkout stays disabled.

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
- API: `curl -fsS https://$SITE_DOMAIN/api/health` (returns `{ "ok": true, "status": "ok"|"degraded", "timestamp": "..." }`)
- Database: `docker compose -f docker-compose.prod.yml exec postgres pg_isready -U nightbeam`
- Sync: sign in as an admin → **Admin → Sync & cache** or `GET /api/sync`

## Security notes

- Secrets live only in `.env`; never commit `.env`.
- **Production:** set `DEV_AUTO_VERIFY=false` so new accounts require SMTP email verification.
- Admin/`/dashboard` routes are protected by middleware *and* server-side
  permission checks.
- Rate limits and (optional) Turnstile protect auth endpoints.
- Analytics are self-hosted in the database; no third-party trackers.

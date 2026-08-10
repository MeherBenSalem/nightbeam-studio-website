#!/bin/bash
set -euo pipefail
cd /home/ubuntu/nightbeam-studio-website

echo "=== env client id suffix ==="
grep -E '^BUILTBYBIT_CLIENT_ID=' .env | sed -E 's/.*=(.{0,0}).{0,}(.{12})$/...\2/'

echo "=== container env suffixes ==="
sudo docker compose -f docker-compose.prod.yml -f docker-compose.server.yml exec -T web \
  sh -c 'echo CID=$(printenv BUILTBYBIT_CLIENT_ID | tail -c 13); echo TOK=$(printenv BUILTBYBIT_API_TOKEN | tail -c 9); echo SEC=$(printenv BUILTBYBIT_CLIENT_SECRET | tail -c 9); echo AUTH_URL=$AUTH_URL; echo APP_URL=$APP_URL'

echo "=== provider file in image ==="
sudo docker compose -f docker-compose.prod.yml -f docker-compose.server.yml exec -T web \
  sed -n '1,80p' src/lib/auth/providers/builtbybit.ts

echo "=== auth logs ==="
sudo docker compose -f docker-compose.prod.yml -f docker-compose.server.yml logs --tail=80 web 2>&1 | tail -80

#!/usr/bin/env bash
set -euo pipefail

[ -f .env ] || cp .env.example .env
[ -f apps/api/.env ] || cp apps/api/.env.example apps/api/.env
[ -f apps/web/.env.local ] || cp apps/web/.env.local.example apps/web/.env.local

npm install
npm run docker:up
npm run db:generate
npm run db:migrate
npm run db:seed

echo "Proyecto preparado. Ejecuta: npm run dev"

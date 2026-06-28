$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
if (-not (Test-Path "apps/api/.env")) { Copy-Item "apps/api/.env.example" "apps/api/.env" }
if (-not (Test-Path "apps/web/.env.local")) { Copy-Item "apps/web/.env.local.example" "apps/web/.env.local" }

npm install
npm run docker:up
npm run db:generate
npm run db:migrate
npm run db:seed

Write-Host "Proyecto preparado. Ejecuta: npm run dev"

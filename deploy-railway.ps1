# 🚂 Script de deployment rápido para Railway (PowerShell)
# Uso: .\deploy-railway.ps1

Write-Host "🚂 Iniciando deployment en Railway..." -ForegroundColor Cyan
Write-Host ""

# Verificar si railway CLI está instalado
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayInstalled) {
    Write-Host "⚠️  Railway CLI no está instalado" -ForegroundColor Yellow
    Write-Host "Instalando Railway CLI..."
    npm install -g @railway/cli
}

Write-Host "📦 Paso 1: Verificando git..." -ForegroundColor Blue
if (-not (Test-Path .git)) {
    Write-Host "Inicializando git..."
    git init
    git add .
    git commit -m "Initial commit - Premium design v2.0"
}

Write-Host ""
Write-Host "🔐 Paso 2: Login en Railway..." -ForegroundColor Blue
railway login

Write-Host ""
Write-Host "🎯 Paso 3: Inicializando proyecto..." -ForegroundColor Blue
railway init

Write-Host ""
Write-Host "🗄️  Paso 4: Agregando PostgreSQL..." -ForegroundColor Blue
railway add --database postgresql

Write-Host ""
Write-Host "⚙️  Paso 5: Configurando variables de entorno..." -ForegroundColor Blue
Write-Host "Configura las siguientes variables en Railway dashboard:"
Write-Host "  - NODE_ENV=production"
Write-Host "  - PORT=4000 (para API)"
Write-Host "  - PORT=3000 (para Web)"
Write-Host ""
Read-Host "Presiona ENTER cuando hayas configurado las variables"

Write-Host ""
Write-Host "🚀 Paso 6: Desplegando aplicación..." -ForegroundColor Blue
railway up

Write-Host ""
Write-Host "✅ ¡Deployment completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Accede a tu aplicación:"
Write-Host "   railway open"
Write-Host ""
Write-Host "📊 Ver logs:"
Write-Host "   railway logs"
Write-Host ""
Write-Host "🔧 Administrar:"
Write-Host "   https://railway.app/dashboard"
Write-Host ""
Write-Host "🎉 ¡Tu aplicación premium está en vivo!" -ForegroundColor Green

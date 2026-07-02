#!/bin/bash

# 🚂 Script de deployment rápido para Railway
# Uso: ./deploy-railway.sh

echo "🚂 Iniciando deployment en Railway..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI no está instalado${NC}"
    echo "Instalando Railway CLI..."
    npm install -g @railway/cli
fi

echo -e "${BLUE}📦 Paso 1: Verificando git...${NC}"
if [ ! -d .git ]; then
    echo "Inicializando git..."
    git init
    git add .
    git commit -m "Initial commit - Premium design v2.0"
fi

echo ""
echo -e "${BLUE}🔐 Paso 2: Login en Railway...${NC}"
railway login

echo ""
echo -e "${BLUE}🎯 Paso 3: Inicializando proyecto...${NC}"
railway init

echo ""
echo -e "${BLUE}🗄️  Paso 4: Agregando PostgreSQL...${NC}"
railway add --database postgresql

echo ""
echo -e "${BLUE}⚙️  Paso 5: Configurando variables de entorno...${NC}"
echo "Configura las siguientes variables en Railway dashboard:"
echo "  - NODE_ENV=production"
echo "  - PORT=4000 (para API)"
echo "  - PORT=3000 (para Web)"
echo ""
read -p "Presiona ENTER cuando hayas configurado las variables..."

echo ""
echo -e "${BLUE}🚀 Paso 6: Desplegando aplicación...${NC}"
railway up

echo ""
echo -e "${GREEN}✅ ¡Deployment completado!${NC}"
echo ""
echo "🌐 Accede a tu aplicación:"
echo "   railway open"
echo ""
echo "📊 Ver logs:"
echo "   railway logs"
echo ""
echo "🔧 Administrar:"
echo "   https://railway.app/dashboard"
echo ""
echo -e "${GREEN}🎉 ¡Tu aplicación premium está en vivo!${NC}"

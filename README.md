# Estudio Digital de Proyectos para Ferretería

## 🎨 ACTUALIZACIÓN: Diseño Premium v2.0

**¡Nuevo!** El proyecto ahora incluye un sistema de diseño premium completo con:

- ✨ **Glassmorphism** - Efectos de vidrio modernos con backdrop-filter
- 🎬 **Animaciones fluidas** - 10+ animaciones predefinidas optimizadas
- 🌈 **Gradientes premium** - 6 nuevos gradientes (Aurora, Sunset, Ocean)
- 📱 **100% Responsive** - Mobile-first con breakpoints optimizados
- ♿ **Accesible** - WCAG compliance y motion preferences
- ⚡ **Performance** - GPU acceleration y CSS optimizado

**Ver demo en vivo**: http://localhost:3000/showcase

📚 **Documentación completa**:
- [Cambios detallados](DESIGN_UPDATE.md)
- [Guía de uso](PREMIUM_USAGE_GUIDE.md)
- [Changelog](CHANGELOG_PREMIUM.md)

---

Repositorio preparado para abrir directamente en **Kiro IDE**. Incluye una vertical funcional del producto y especificaciones completas para continuar su desarrollo con un flujo guiado por requisitos.

## Qué incluye

- Aplicación web editorial basada en una mesa de proyecto, no en una tienda tradicional.
- Calculadora funcional de pintura con puertas, ventanas, manos, rendimiento, estado de superficie y desperdicio.
- Propuestas de color, materiales, presentaciones, stock de demostración y presupuesto.
- API NestJS con Swagger, persistencia PostgreSQL mediante Prisma y PDF de cotización.
- Motor de cálculo compartido y probado con Vitest.
- Base de datos relacional preparada para usuarios, organizaciones, proyectos, superficies, productos, inventario, cotizaciones y pedidos.
- Docker Compose para PostgreSQL y Redis.
- Especificaciones Kiro en `.kiro/specs`.
- Contexto permanente para el agente en `.kiro/steering`.
- Hook de calidad opcional en `.kiro/hooks`.

## Inicio rápido

### 1. Requisitos

- Node.js 22 o superior.
- Docker Desktop.
- Kiro IDE.

### 2. Preparar variables

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.local.example apps/web/.env.local
```

En macOS o Linux:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

### 3. Instalar y preparar

```bash
npm install
npm run docker:up
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

### 4. Abrir

- Web: http://localhost:3000
- Estudio: http://localhost:3000/studio
- API: http://localhost:4000/api
- Swagger: http://localhost:4000/docs
- PDF de demostración: http://localhost:4000/api/quotes/demo/pdf

## Cómo usarlo en Kiro

1. Descomprime la carpeta.
2. Abre **la carpeta raíz completa** en Kiro.
3. Revisa `START_HERE_KIRO.md`.
4. En el panel Specs, abre `00-platform-foundation` o la funcionalidad que quieras desarrollar.
5. Ejecuta las tareas en el orden propuesto.

Kiro detectará automáticamente los archivos de `.kiro/steering`, `.kiro/specs` y `.kiro/hooks` porque se encuentran en la raíz del workspace.

## Estado real del proyecto

El ZIP contiene una **base ejecutable y una vertical funcional**, además del diseño completo del producto. No representa una plataforma de producción terminada: autenticación empresarial, procesamiento avanzado de fotografías, pagos reales, integraciones ERP/POS y sincronización con proveedores están especificados como tareas posteriores dentro de Kiro.

## 🚂 Deploy en Railway

Para desplegar la aplicación en producción:

### Opción 1: Script Automático (Recomendado)

**Windows PowerShell:**
```powershell
.\deploy-railway.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy-railway.sh
./deploy-railway.sh
```

### Opción 2: Manual

1. Instala Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Inicializa: `railway init`
4. Agrega PostgreSQL: `railway add --database postgresql`
5. Deploy: `railway up`

📚 **Documentación completa**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

### Variables de Entorno en Railway

```env
# Automáticas (provistas por Railway)
DATABASE_URL=postgresql://...

# Manuales (debes configurar)
NODE_ENV=production
PORT=4000  # Para API
PORT=3000  # Para Web
```

## Decisiones principales

- Monolito modular antes que microservicios.
- PostgreSQL como fuente de verdad.
- Redis para cache y colas en etapas posteriores.
- Reglas determinísticas para cálculos e inventario.
- IA como asistencia, no como autoridad técnica.
- Proyecto y ambiente como centro de la experiencia.

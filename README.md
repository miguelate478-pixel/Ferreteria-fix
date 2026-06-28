# Estudio Digital de Proyectos para Ferretería

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

## Decisiones principales

- Monolito modular antes que microservicios.
- PostgreSQL como fuente de verdad.
- Redis para cache y colas en etapas posteriores.
- Reglas determinísticas para cálculos e inventario.
- IA como asistencia, no como autoridad técnica.
- Proyecto y ambiente como centro de la experiencia.

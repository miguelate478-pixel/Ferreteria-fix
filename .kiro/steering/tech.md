---
inclusion: always
---
# Tecnología

## Stack aprobado

- Monorepo npm workspaces.
- Frontend: Next.js, React, TypeScript.
- Backend: NestJS modular.
- Persistencia: PostgreSQL y Prisma.
- Cache y colas: Redis/BullMQ cuando la tarea lo requiera.
- Imágenes: almacenamiento compatible con S3 y workers asíncronos.
- PDF: plantilla versionada; la demo usa PDFKit y la versión visual podrá migrar a HTML/Chromium.
- Observabilidad: OpenTelemetry y Sentry en la etapa productiva.

## Arquitectura

Usar monolito modular. No crear microservicios sin evidencia de escalamiento, aislamiento operativo o despliegue independiente. Los módulos no deben acceder directamente a las tablas internas de otros módulos fuera de interfaces acordadas.

## Reglas de implementación

- TypeScript estricto.
- Validar entradas en el límite HTTP.
- El motor de cálculo debe seguir siendo una librería pura, sin acceso a red o base de datos.
- Guardar snapshots en cálculos, cotizaciones y pedidos.
- Toda operación monetaria utiliza Decimal en base de datos.
- Fechas se almacenan en UTC.
- Los endpoints nuevos deben aparecer en Swagger.

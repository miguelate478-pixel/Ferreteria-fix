# Reporte de validación

Fecha: 27 de junio de 2026.

## Controles superados

- `npm install`: dependencias resueltas y `package-lock.json` generado.
- `npm run typecheck`: motor, API y web sin errores TypeScript.
- `npm test`: 3 pruebas del motor de cálculo aprobadas.
- `npm run build`: motor, API y aplicación Next.js compilados.
- Inicio de Next.js en producción y respuesta HTTP 200 en `/` y `/studio`.
- Esquema Prisma formateado y validado con el parser WASM correspondiente al commit de Prisma 6.19.1.
- JSON de hooks Kiro válido.

## Limitación del entorno de validación

El comando `prisma generate` intentó descargar su motor nativo desde `binaries.prisma.sh`, dominio no resoluble dentro del entorno aislado utilizado para empaquetar el proyecto. El esquema sí fue validado con el parser oficial correspondiente. En una computadora con acceso normal a Internet, `npm run db:generate` realizará esa descarga durante la preparación inicial.

## Alcance funcional validado

- Cálculo de una habitación de 5 m × 4 m y 2.5 m de altura.
- Descuento de puerta y ventana.
- Rendimiento efectivo, manos y desperdicio.
- Optimización básica de envases.
- Cambio interactivo de paletas.
- Página inicial y mesa de proyecto responsive.
- API compilable y endpoint PDF implementado.

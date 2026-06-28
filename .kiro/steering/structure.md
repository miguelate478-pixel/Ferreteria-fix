---
inclusion: always
---
# Estructura del repositorio

```text
apps/web        interfaz Next.js
apps/api        API NestJS y Prisma
packages/calculation-engine  funciones puras de cálculo y optimización
docs            arquitectura, UX, API y decisiones
.kiro/specs     requisitos, diseño y tareas ejecutables
.kiro/steering  contexto permanente del agente
```

## Convenciones

- Componentes React: PascalCase.
- Hooks y utilidades: camelCase.
- Módulos backend por capacidad de negocio, no por tipo técnico global.
- DTO en `module/dto`.
- Servicios de dominio puros en `packages` o dentro de un módulo con tests.
- No crear carpetas `utils` genéricas; usar nombres orientados a capacidad.
- Los archivos generados no se editan manualmente.

## Flujo de cambios

1. Leer la spec correspondiente.
2. Actualizar o agregar pruebas.
3. Implementar el cambio mínimo coherente.
4. Ejecutar `npm run typecheck`, `npm test` y, cuando corresponda, `npm run build`.
5. Actualizar tareas y documentación afectada.

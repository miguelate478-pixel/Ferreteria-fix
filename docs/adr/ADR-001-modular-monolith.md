# ADR-001: Monolito modular para la primera versión

## Estado

Aceptado.

## Contexto

El producto contiene capacidades diferenciadas, pero el equipo necesita iterar reglas de negocio, UX, catálogo e integraciones con rapidez. Microservicios tempranos elevarían costos de despliegue, observabilidad, consistencia y pruebas.

## Decisión

Implementar un monolito NestJS organizado por módulos de negocio, con PostgreSQL como fuente de verdad y procesos asíncronos separados como workers del mismo repositorio.

## Consecuencias positivas

- Transacciones simples.
- Menor complejidad operacional.
- Refactor rápido durante validación.
- Contratos internos claros antes de separar servicios.

## Criterios para extraer un servicio

- Escalamiento claramente distinto.
- Fallos que deban aislarse.
- Equipo propietario independiente.
- Despliegue autónomo requerido.
- Frontera estable y eventos bien definidos.

# Empieza aquí en Kiro

## Objetivo del workspace

Construir un estudio digital de proyectos para una ferretería enfocada inicialmente en pinturas. El usuario describe un espacio y recibe colores, cantidades, materiales, stock, precio, instrucciones y cotización.

## Qué debe hacer Kiro al abrir este proyecto

Kiro encontrará contexto persistente en `.kiro/steering/` y seis especificaciones ejecutables en `.kiro/specs/`.

### Orden recomendado

1. `00-platform-foundation`
2. `01-paint-calculator`
3. `02-color-assistant`
4. `03-photo-visualizer`
5. `04-inventory-quotes-orders`
6. `05-professional-admin`

## Primer mensaje recomendado para Kiro

```text
Lee todos los archivos de .kiro/steering y revisa la especificación 00-platform-foundation. Luego inspecciona el código existente, ejecuta typecheck y tests, identifica diferencias entre el estado actual y las tareas pendientes, y empieza por la primera tarea no completada sin cambiar la arquitectura ni el lenguaje visual definidos.
```

## Reglas importantes

- No convertir la interfaz en una tienda tradicional de tarjetas y carruseles.
- No asumir que los metros cuadrados informados corresponden a paredes.
- No inventar rendimiento, compatibilidad o stock.
- Toda cotización debe congelar precio, descripción, rendimiento y fórmula de color.
- Toda sustitución debe explicar qué propiedades conserva y cuáles cambia.
- Las tareas avanzadas deben respetar la vertical funcional existente.

## Comandos de control

```bash
npm run typecheck
npm test
npm run build
```

## Demostración existente

La ruta `/studio` incluye una calculadora interactiva. El endpoint `/api/quotes/demo/pdf` genera una cotización PDF básica. Estas piezas sirven como referencia de comportamiento y deben evolucionar, no ser eliminadas sin reemplazo funcional.

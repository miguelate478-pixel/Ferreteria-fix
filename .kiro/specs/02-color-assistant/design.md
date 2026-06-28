# Diseño: Asistente de color

## Motor híbrido

1. Reglas duras: exclusiones, compatibilidad, base tintométrica, inventario y accesibilidad.
2. Generación de candidatos: relaciones armónicas y colecciones de marca.
3. Scoring configurable por ambiente, luz, mobiliario, sensación, preferencias, stock y presupuesto.
4. Explicación en lenguaje natural basada en hechos trazables.

## Modelo de puntaje inicial

```text
25% ambiente
20% iluminación
15% piso y mobiliario
15% sensación
10% preferencias
5% accesibilidad
5% disponibilidad
5% presupuesto
```

## Datos de color

Guardar RGB para render, LAB/OKLCH para distancias perceptuales y código comercial para producción. La visualización nunca sustituye una muestra física.

## API propuesta

- `POST /color-recommendations`
- `GET /colors?brand=&family=&availableAt=`
- `POST /palettes/:id/variants`
- `POST /palettes/:id/validate-stock`

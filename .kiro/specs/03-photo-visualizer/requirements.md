# Requisitos: Visualizador sobre fotografía

## R1. Carga segura

- CUANDO el usuario cargue una fotografía, EL SISTEMA DEBERÁ validar formato, tamaño y contenido.
- EL SISTEMA DEBERÁ corregir orientación y eliminar metadatos no necesarios.
- EL SISTEMA DEBERÁ usar acceso privado mediante URLs firmadas.

## R2. Segmentación

- CUANDO una foto sea procesada, EL SISTEMA DEBERÁ proponer máscaras para paredes, techo, puertas y ventanas.
- EL USUARIO DEBERÁ poder corregir la máscara con pincel, borrador y deshacer.
- EL SISTEMA DEBERÁ conservar máscara automática, corrección y versión del modelo.

## R3. Render

- CUANDO se aplique un color, EL SISTEMA DEBERÁ conservar sombras, textura y variaciones de luz.
- EL SISTEMA DEBERÁ permitir antes/después y comparación de propuestas.
- EL SISTEMA DEBERÁ indicar que la simulación es referencial.

## R4. Rendimiento

- EL SISTEMA DEBERÁ generar versiones optimizadas para móvil y escritorio.
- CUANDO el procesamiento sea pesado, EL SISTEMA DEBERÁ realizarlo en cola y notificar progreso.

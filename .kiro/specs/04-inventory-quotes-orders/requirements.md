# Requisitos: Inventario, cotizaciones y pedidos

## R1. Inventario

- CUANDO se consulte un producto, EL SISTEMA DEBERÁ mostrar disponible, reservado y en tránsito por sucursal.
- EL SISTEMA DEBERÁ indicar la fecha y fuente de actualización.
- ANTES de confirmar un pedido, EL SISTEMA DEBERÁ volver a validar stock y precio.

## R2. Sustitución

- CUANDO un producto no tenga stock, EL SISTEMA DEBERÁ proponer sustitutos compatibles.
- CADA sustitución DEBERÁ explicar diferencias de acabado, rendimiento, manos, presentación, precio y disponibilidad.
- EL SISTEMA NO DEBERÁ sustituir un producto incompatible solo por pertenecer a la misma categoría.

## R3. Cotización

- CUANDO se genere una cotización, EL SISTEMA DEBERÁ crear una versión inmutable con snapshot de productos, precios, fórmulas, impuestos, stock y cálculo.
- CUANDO se modifique una cotización enviada, EL SISTEMA DEBERÁ crear una nueva versión.
- EL PDF DEBERÁ incluir resumen del proyecto, medidas, colores, cantidades, materiales, condiciones, vigencia y advertencias.

## R4. Pedido y cumplimiento

- CUANDO una cotización sea aceptada, EL SISTEMA DEBERÁ convertirla en pedido idempotente.
- EL CLIENTE DEBERÁ poder elegir recojo o despacho.
- CUANDO se reserve stock, EL SISTEMA DEBERÁ registrar vencimiento y liberación.

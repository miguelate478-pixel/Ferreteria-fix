# Diseño: Calculadora de pintura

## Fórmulas

```text
piso = largo × ancho
paredesBrutas = 2 × (largo + ancho) × altura
aberturas = Σ(ancho × alto × cantidad)
paredesNetas = paredesBrutas − aberturas − exclusiones
rendimientoEfectivo = rendimientoNominal × factorSuperficie × factorAplicación
litrosBase = áreaPintable × manos / rendimientoEfectivo
litrosFinales = litrosBase × (1 + desperdicio/100)
```

## Componentes

- `calculation-engine`: funciones puras y optimizador de presentaciones.
- `CalculationService`: obtiene reglas, ejecuta motor y persiste snapshot.
- `MaterialRuleEngine`: produce requisitos por preparación, aplicación y protección.
- `PackageOptimizer`: minimiza costo ponderado, sobrante, quiebre de stock y exceso de envases.

## Casos especiales

Pared de acento, techos inclinados, columnas, escaleras, superficies rugosas, cambio oscuro-claro, humedad, salitre, metal, madera y pulverización.

## Pruebas

Valores límite, unidades, aberturas inválidas, redondeo comercial, múltiples productos, stock insuficiente y comparación contra benchmark técnico.

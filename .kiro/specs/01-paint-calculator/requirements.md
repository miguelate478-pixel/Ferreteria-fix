# Requisitos: Calculadora de pintura y materiales

## R1. Interpretación del área

- CUANDO el usuario informe un valor en m² sin contexto, EL SISTEMA DEBERÁ preguntar si corresponde a piso o superficie pintable.
- SI el valor corresponde al piso, EL SISTEMA DEBERÁ solicitar forma y altura antes de calcular paredes.
- SI el usuario conoce el área pintable, EL SISTEMA DEBERÁ permitir un modo rápido sin reconstruir geometría.

## R2. Superficies

- CUANDO el ambiente sea rectangular, EL SISTEMA DEBERÁ calcular paredes mediante perímetro por altura.
- CUANDO existan puertas, ventanas o exclusiones, EL SISTEMA DEBERÁ descontarlas de la superficie correspondiente.
- CUANDO una abertura supere el área de su pared, EL SISTEMA DEBERÁ rechazar el cálculo y señalar el dato inconsistente.
- CUANDO se seleccione techo, EL SISTEMA DEBERÁ calcularlo por separado.

## R3. Consumo

- CUANDO se seleccione un producto, EL SISTEMA DEBERÁ usar su rendimiento específico y manos mínimas.
- CUANDO cambie el estado de superficie o método de aplicación, EL SISTEMA DEBERÁ ajustar el rendimiento efectivo.
- CUANDO se configure desperdicio, EL SISTEMA DEBERÁ aplicarlo al final del cálculo.

## R4. Presentaciones y propuestas

- CUANDO se conozcan litros requeridos, EL SISTEMA DEBERÁ buscar una combinación de envases suficiente.
- EL SISTEMA DEBERÁ evaluar costo, sobrante, stock y cantidad de envases.
- CUANDO se comparen alternativas económica, recomendada y premium, EL SISTEMA DEBERÁ recalcular cada una con sus propias fichas técnicas.

## R5. Materiales

- CUANDO la superficie sea porosa, EL SISTEMA DEBERÁ recomendar sellado según regla técnica.
- CUANDO existan grietas o imperfecciones, EL SISTEMA DEBERÁ incluir reparación y lijado.
- EL SISTEMA DEBERÁ permitir excluir herramientas que el cliente ya posee.

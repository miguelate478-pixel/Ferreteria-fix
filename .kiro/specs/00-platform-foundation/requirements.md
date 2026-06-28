# Requisitos: Fundación de plataforma

## R1. Workspace ejecutable

- CUANDO un desarrollador clone o descomprima el repositorio, EL SISTEMA DEBERÁ poder instalar dependencias con `npm install`.
- CUANDO se ejecuten PostgreSQL y Redis mediante Docker, EL SISTEMA DEBERÁ permitir generar, migrar y sembrar la base de datos.
- CUANDO se ejecute `npm run dev`, EL SISTEMA DEBERÁ iniciar web, API y motor compartido.

## R2. Proyectos y ambientes

- CUANDO un usuario cree un proyecto, EL SISTEMA DEBERÁ guardar propietario, tipo, moneda y estado.
- CUANDO se cree un ambiente, EL SISTEMA DEBERÁ permitir registrar largo, ancho, altura y tipo de ambiente.
- CUANDO un proyecto cambie, EL SISTEMA DEBERÁ conservar fecha, versión y actor para cambios críticos.

## R3. Arquitectura modular

- CUANDO se agregue una capacidad, EL SISTEMA DEBERÁ ubicarla en un módulo de negocio explícito.
- SI una capacidad requiere trabajo asíncrono, EL SISTEMA DEBERÁ publicarlo a una cola sin bloquear la respuesta HTTP.
- MIENTRAS no exista una necesidad operacional demostrada, EL SISTEMA DEBERÁ permanecer como monolito modular.

## R4. Calidad

- CUANDO cambie el motor de cálculo, EL SISTEMA DEBERÁ ejecutar pruebas unitarias.
- CUANDO se agregue un endpoint, EL SISTEMA DEBERÁ documentarlo en Swagger.
- CUANDO se almacenen importes, EL SISTEMA DEBERÁ usar tipos decimales y moneda explícita.

---
inclusion: always
---
# Estándares de código

- Preferir funciones pequeñas y nombres explícitos.
- No usar `any` salvo integración externa documentada.
- Errores de dominio con mensajes útiles y códigos estables.
- Los cálculos deben ser determinísticos y cubiertos por pruebas de borde.
- No redondear en pasos intermedios salvo regla comercial expresa; redondear para presentación o persistencia definida.
- Evitar estados duplicados en React; derivar valores con `useMemo` o selectores.
- Aislar llamadas HTTP de los componentes visuales.
- Toda consulta de inventario debe distinguir `available`, `reserved` e `inTransit`.
- Usar snapshots para evitar que cambios de catálogo alteren documentos históricos.

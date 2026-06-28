# Diseño: Visualizador fotográfico

## Flujo

```mermaid
sequenceDiagram
  participant W as Web
  participant A as API
  participant S as Storage
  participant Q as Queue
  participant K as Worker
  W->>A: solicitar URL de carga
  A-->>W: URL firmada
  W->>S: cargar fotografía
  W->>A: confirmar archivo
  A->>Q: publicar procesamiento
  Q->>K: normalizar y segmentar
  K->>S: guardar previews y máscaras
  K->>A: actualizar estado
  A-->>W: progreso/resultado
```

## Primera entrega

Selección manual o semiautomática con máscara editable. La segmentación avanzada no bloquea el MVP.

## Render

Convertir color objetivo a un espacio perceptual y combinarlo con luminancia/textura de la superficie original. Mantener parámetros versionados.

## Privacidad

No usar fotografías para entrenamiento sin consentimiento específico. Definir retención, eliminación y exportación.

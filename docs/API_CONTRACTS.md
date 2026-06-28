# Contratos API propuestos

Prefijo: `/api`

## Implementados en la vertical

| Método | Ruta | Uso |
|---|---|---|
| GET | `/health` | Estado del servicio |
| POST | `/calculations/paint` | Calcula área, litros y envases |
| GET | `/catalog/products` | Productos con ficha y stock |
| GET | `/projects` | Lista proyectos |
| POST | `/projects` | Crea proyecto y primer ambiente |
| GET | `/quotes/demo/pdf` | PDF de demostración |

## Objetivo del producto

### Proyectos

- `GET /projects/:id`
- `PATCH /projects/:id`
- `POST /projects/:id/rooms`
- `POST /rooms/:id/surfaces`
- `POST /surfaces/:id/openings`

### Colores

- `POST /color-recommendations`
- `POST /palettes/:id/variants`
- `POST /palettes/:id/validate-stock`

### Imágenes

- `POST /uploads/presign`
- `POST /photos/:id/process`
- `GET /photos/:id/status`
- `PUT /photo-masks/:id`

### Cotización y pedido

- `POST /projects/:id/quotes`
- `POST /quotes/:id/versions`
- `GET /quote-versions/:id/pdf`
- `POST /quote-versions/:id/reserve`
- `POST /quote-versions/:id/accept`
- `POST /quote-versions/:id/convert-to-order`

## Reglas transversales

- Errores con `code`, `message`, `details` y `correlationId`.
- Paginación cursor para colecciones crecientes.
- Idempotency-Key en pago, aceptación, reserva y conversión.
- ETag o control de versión para edición concurrente.
- Organización derivada del usuario autenticado, no confiada desde el body.

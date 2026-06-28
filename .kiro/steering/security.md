---
inclusion: always
---
# Seguridad y privacidad

- Autenticación OIDC en producción y MFA para administradores.
- Autorización por organización, proyecto y rol.
- Nunca confiar en `organizationId` enviado por el cliente sin verificar pertenencia.
- URLs de imágenes firmadas y de corta duración.
- Validar MIME, extensión, tamaño y contenido de archivos.
- Eliminar metadatos EXIF sensibles cuando no sean necesarios.
- Secretos solo en variables de entorno o gestor de secretos.
- Proteger endpoints mutables con rate limit e idempotencia cuando corresponda.
- Registrar cambios de precio, stock, cotización, fórmula de color y permisos.
- No registrar tokens, contraseñas ni fotografías completas en logs.
- Aplicar minimización y política de eliminación de datos.

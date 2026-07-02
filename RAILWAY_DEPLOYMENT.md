# 🚂 Guía de Deployment en Railway

## 📋 Pre-requisitos

1. Cuenta en [Railway.app](https://railway.app)
2. Git instalado y proyecto inicializado
3. Proyecto pusheado a GitHub/GitLab (recomendado)

## 🚀 Método 1: Deploy desde GitHub (Recomendado)

### Paso 1: Subir el código a GitHub

```bash
# Inicializar git si no está inicializado
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Premium design v2.0"

# Agregar remote (reemplaza con tu repo)
git remote add origin https://github.com/tu-usuario/ferreteria-estudio-digital.git

# Push
git push -u origin main
```

### Paso 2: Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) y haz login
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu cuenta de GitHub si no lo has hecho
5. Selecciona el repositorio `ferreteria-estudio-digital`

### Paso 3: Configurar Base de Datos PostgreSQL

1. En tu proyecto de Railway, click en "+ New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos
4. Copia las variables de entorno que se generan

### Paso 4: Configurar Variables de Entorno

En Railway, ve a tu servicio y agrega estas variables:

#### Variables para la API:

```env
# Database (Railway proveerá estas automáticamente)
DATABASE_URL=postgresql://...

# API Configuration
PORT=4000
NODE_ENV=production
API_URL=https://tu-api.railway.app
```

#### Variables para el Web:

```env
# Web Configuration
NEXT_PUBLIC_API_URL=https://tu-api.railway.app/api
PORT=3000
NODE_ENV=production
```

### Paso 5: Deploy

Railway automáticamente:
1. ✅ Detectará el `railway.toml`
2. ✅ Instalará dependencias
3. ✅ Ejecutará el build
4. ✅ Ejecutará migraciones de Prisma
5. ✅ Iniciará la aplicación

## 🚀 Método 2: Deploy con Railway CLI

### Instalación del CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login
```

### Desplegar

```bash
# Inicializar proyecto
railway init

# Link a proyecto existente (opcional)
railway link

# Agregar PostgreSQL
railway add --database postgresql

# Deploy
railway up
```

## 🔧 Configuración Avanzada

### railway.toml

El archivo `railway.toml` ya está configurado con:

```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run start:railway"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### Estructura de Servicios

Railway detectará automáticamente:

1. **API Service** (Puerto 4000)
   - NestJS backend
   - Prisma ORM
   - PostgreSQL connection

2. **Web Service** (Puerto 3000)
   - Next.js frontend
   - SSR enabled
   - Conectado a API

3. **PostgreSQL Database**
   - Provisto por Railway
   - Backups automáticos

## 📝 Variables de Entorno Necesarias

### Para Railway (Automáticas):
```env
DATABASE_URL          # Provisto por Railway
PGHOST               # Provisto por Railway
PGPORT               # Provisto por Railway
PGUSER               # Provisto por Railway
PGPASSWORD           # Provisto por Railway
PGDATABASE           # Provisto por Railway
```

### Para tu aplicación (Manuales):
```env
# API
NODE_ENV=production
PORT=4000
API_URL=${{RAILWAY_STATIC_URL}}

# Web
NEXT_PUBLIC_API_URL=https://tu-dominio-api.railway.app/api
```

## 🔍 Verificación del Deployment

Una vez desplegado, verifica:

1. **Health Check API**: `https://tu-api.railway.app/api/health`
2. **Swagger Docs**: `https://tu-api.railway.app/docs`
3. **Web App**: `https://tu-web.railway.app`
4. **Showcase**: `https://tu-web.railway.app/showcase`

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que `DATABASE_URL` esté configurada
2. Asegúrate que la migración se ejecutó: `railway run npm run db:migrate:deploy`

### Error: "Module not found"

**Solución:**
1. Limpia cache: `railway run npm cache clean --force`
2. Re-deploy: `railway up --detach`

### Error: "Port already in use"

**Solución:**
Railway asigna puertos automáticamente. Asegúrate que tu app use `process.env.PORT`:

```typescript
// apps/api/src/main.ts
const port = process.env.PORT || 4000;
```

### Build tarda mucho

**Solución:**
1. Verifica que `.railwayignore` esté configurado
2. Optimiza el build eliminando archivos innecesarios

## 📊 Monitoreo

Railway provee:
- 📈 Logs en tiempo real
- 📊 Métricas de CPU y memoria
- 🔔 Alertas de errores
- 📉 Analytics de deployment

Accede desde el dashboard de Railway.

## 🌐 Dominios Personalizados

### Agregar dominio custom:

1. Ve a Settings → Domains
2. Click "+ Add Domain"
3. Ingresa tu dominio: `app.tudominio.com`
4. Configura DNS según instrucciones de Railway

### Configuración DNS:

```
Type: CNAME
Name: app
Value: tu-app.up.railway.app
TTL: Auto
```

## 🔄 CI/CD Automático

Railway automáticamente despliega cuando:
- ✅ Haces push a la rama principal
- ✅ Merges un PR
- ✅ Actualizas el código

### Configurar branches:

```bash
# Deploy desde staging branch
railway environment staging
railway up
```

## 💰 Costos

Railway ofrece:
- **Plan Hobby**: $5/mes + uso
- **Plan Pro**: $20/mes + uso

Costos aproximados mensuales:
- PostgreSQL: ~$5
- API Service: ~$3-5
- Web Service: ~$3-5
- **Total**: ~$11-15/mes

## 🔒 Seguridad

### Variables sensibles:

Nunca commitees:
- ❌ `.env`
- ❌ `.env.local`
- ❌ Claves privadas

Usa Railway Secrets para:
- ✅ API Keys
- ✅ Database passwords
- ✅ JWT secrets

## 🚀 Optimizaciones

### 1. Habilitar Caching

```toml
[build]
buildCommand = "npm ci && npm run build"
```

### 2. Usar Redis (Opcional)

```bash
railway add --database redis
```

### 3. Configurar CDN

Railway incluye CDN automático para assets estáticos.

## 📞 Soporte

- 📚 Docs: [docs.railway.app](https://docs.railway.app)
- 💬 Discord: [railway.app/discord](https://railway.app/discord)
- 🐦 Twitter: [@Railway](https://twitter.com/Railway)

## ✅ Checklist de Deployment

- [ ] Código en GitHub/GitLab
- [ ] `railway.toml` configurado
- [ ] Variables de entorno definidas
- [ ] PostgreSQL agregada
- [ ] Build exitoso localmente
- [ ] Migraciones de DB ejecutadas
- [ ] Health checks funcionando
- [ ] Dominios configurados (opcional)
- [ ] SSL/HTTPS activo
- [ ] Monitoreo configurado

## 🎉 ¡Deployment Exitoso!

Tu aplicación premium ahora está en vivo en:

- **Web**: https://tu-app.railway.app
- **API**: https://tu-api.railway.app
- **Showcase**: https://tu-app.railway.app/showcase

Comparte tus URLs y disfruta de tu aplicación en producción! 🚀

---

**Última actualización**: 2 Julio 2026
**Versión**: 2.0 Premium

# 🚀 ¡CÓDIGO SUBIDO! Ahora Despliega en Railway

## ✅ Código ya está en GitHub

Tu código premium está en: **https://github.com/miguelate478-pixel/Ferreteria-fix**

Ahora sigue estos pasos para desplegarlo en Railway:

---

## 🚂 Opción A: Deploy desde Railway Web (MÁS FÁCIL)

### Paso 1: Ve a Railway
👉 **https://railway.app**

### Paso 2: Login con GitHub
1. Click en "Login"
2. Selecciona "Login with GitHub"
3. Autoriza Railway

### Paso 3: Nuevo Proyecto
1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca: **"Ferreteria-fix"**
4. Click en el repositorio

### Paso 4: Railway hace TODO automáticamente
Railway detectará:
- ✅ `railway.toml` (configuración)
- ✅ `package.json` (dependencias)
- ✅ Scripts de build
- ✅ Prisma (migraciones)

### Paso 5: Agregar PostgreSQL
1. En tu proyecto, click en "+ New"
2. Selecciona "Database"
3. Click "Add PostgreSQL"
4. Railway conecta automáticamente la DB

### Paso 6: Variables de Entorno (Opcional)
Railway ya configuró `DATABASE_URL` automáticamente.

Solo agrega (opcional):
```env
NODE_ENV=production
```

1. Click en tu servicio
2. Ve a "Variables"
3. Click "+ New Variable"
4. Nombre: `NODE_ENV`, Valor: `production`

### Paso 7: ¡Deploy Automático!
Railway automáticamente:
1. ✅ Clona el código
2. ✅ Instala dependencias
3. ✅ Ejecuta build
4. ✅ Ejecuta migraciones de Prisma
5. ✅ Inicia tu app

### Paso 8: Ver tu App
1. Ve a "Settings" → "Domains"
2. Railway generó un dominio como: `tu-app-production.up.railway.app`
3. Click en el dominio para abrir tu app

---

## 🚂 Opción B: Deploy con Railway CLI (MÁS RÁPIDO)

```powershell
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link al proyecto de GitHub
railway link

# 4. Agregar PostgreSQL
railway add

# Selecciona: PostgreSQL

# 5. Ver estado
railway status

# 6. Abrir tu app
railway open
```

---

## 🎯 URLs de tu App Desplegada

Después del deploy, tendrás:

### Web App
```
https://ferreteria-fix-production.up.railway.app
```

### API
```
https://ferreteria-fix-production.up.railway.app/api
```

### Swagger Docs
```
https://ferreteria-fix-production.up.railway.app/docs
```

### Health Check
```
https://ferreteria-fix-production.up.railway.app/api/health
```

### 🎨 Showcase Premium
```
https://ferreteria-fix-production.up.railway.app/showcase
```

---

## 📊 Verificar que Todo Funciona

### 1. Health Check
```
https://tu-dominio.railway.app/api/health
```
Debería mostrar:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. Ver Logs
En Railway dashboard:
- Click en tu servicio
- Ve a "Deployments"
- Click en el deployment activo
- Ver logs en tiempo real

### 3. Swagger
```
https://tu-dominio.railway.app/docs
```
Deberías ver toda la documentación de la API

---

## 🐛 Si Algo Sale Mal

### Ver Logs en Railway
1. Dashboard → Tu proyecto
2. Click en el servicio
3. Tab "Deployments"
4. Click en el deployment
5. Ver logs

### Ejecutar Comandos en Railway

```powershell
# Conectar via CLI
railway login
railway link

# Ver logs
railway logs

# Ejecutar migraciones manualmente
railway run npm run db:migrate:deploy

# Seedear la base de datos
railway run npm run db:seed
```

### Problemas Comunes

**Error: "Cannot connect to database"**
```powershell
railway run npm run db:migrate:deploy
```

**Error: "Module not found"**
```powershell
railway run npm cache clean --force
```

---

## 🔄 Actualizar después de Cambios

Cada vez que hagas cambios y los subas a GitHub:

```powershell
git add .
git commit -m "Descripción del cambio"
git push
```

Railway **automáticamente** detecta el push y redeploya.

---

## 💡 Configuración Avanzada (Opcional)

### Agregar Dominio Personalizado

1. Railway Dashboard → Tu proyecto
2. Settings → Domains
3. "+ Add Domain"
4. Ingresa: `app.tudominio.com`
5. Configura DNS:
   ```
   Type: CNAME
   Name: app
   Value: [el valor que Railway te da]
   ```

### Configurar Variables de Entorno Secretas

Para APIs keys, secrets, etc:
1. Click en tu servicio
2. Variables tab
3. "+ New Variable"
4. Nombre y valor
5. Click "Add"

### Monitoreo y Alertas

Railway incluye:
- 📈 CPU y memoria en tiempo real
- 📊 Logs agregados
- 🔔 Notificaciones de deploy
- ⚠️ Alertas de errores

---

## 💰 Costos

Railway cobra por uso:

- **$5/mes de crédito incluido** (Plan Hobby)
- PostgreSQL: ~$5/mes
- App (Web + API): ~$3-8/mes
- **Total**: ~$8-13/mes

Si pasas el crédito incluido, pagas solo lo que usas.

---

## ✅ Checklist Final

- [x] ✅ Código subido a GitHub
- [ ] Login en Railway
- [ ] Proyecto creado desde GitHub
- [ ] PostgreSQL agregada
- [ ] Variables configuradas (opcional)
- [ ] Deploy exitoso
- [ ] Health check funcionando
- [ ] Web app cargando
- [ ] Showcase premium visible

---

## 🎉 ¡SIGUIENTE PASO!

### Opción Recomendada: Railway Web UI

1. **Abre**: https://railway.app
2. **Login** con GitHub
3. **New Project** → Deploy from GitHub repo
4. **Selecciona**: Ferreteria-fix
5. **Agrega**: PostgreSQL
6. **¡Listo!** Railway hace el resto

**Tiempo total: 3-5 minutos**

---

## 📞 Soporte

- 📚 Docs: https://docs.railway.app
- 💬 Discord: https://railway.app/discord
- 🐦 Twitter: @Railway

---

**🚀 Tu código premium está listo para producción.**

**El diseño glassmorphism, animaciones y todos los efectos premium funcionarán perfectamente en Railway.**

¡Disfruta de tu app en vivo! 🎨✨

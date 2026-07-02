# 🚀 Guía Rápida: Subir a Railway en 5 Minutos

## ⚡ Opción 1: Usando Railway CLI (Más Rápido)

### Paso 1: Instalar Railway CLI

```powershell
npm install -g @railway/cli
```

### Paso 2: Login

```powershell
railway login
```
Se abrirá tu navegador. Autoriza la aplicación.

### Paso 3: Inicializar Proyecto

```powershell
# En la carpeta del proyecto
cd c:\Users\Farmacias\Downloads\ferreteria-estudio-digital-kiro\ferreteria-estudio-digital-kiro

# Inicializar
railway init
```

Selecciona:
- "Create a new project"
- Dale un nombre: "ferreteria-estudio-digital"

### Paso 4: Agregar Base de Datos

```powershell
railway add
```

Selecciona: "PostgreSQL"

### Paso 5: Deploy

```powershell
railway up
```

¡Eso es todo! Railway automáticamente:
- ✅ Instala dependencias
- ✅ Ejecuta build
- ✅ Ejecuta migraciones de DB
- ✅ Inicia tu app

### Paso 6: Ver tu App

```powershell
railway open
```

---

## 🌐 Opción 2: Usando la Web (Recomendado para Principiantes)

### Paso 1: Subir a GitHub

```powershell
# Inicializar git
git init

# Agregar archivos
git add .

# Commit
git commit -m "Initial commit - Premium design v2.0"

# Crear repo en GitHub y luego:
git remote add origin https://github.com/TU-USUARIO/ferreteria-estudio-digital.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar Railway con GitHub

1. Ve a [railway.app](https://railway.app)
2. Click "Login" y usa GitHub
3. Click "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Busca tu repo: `ferreteria-estudio-digital`
6. Click en el repo

### Paso 3: Agregar PostgreSQL

1. En tu proyecto, click "+ New"
2. Selecciona "Database"
3. Click "Add PostgreSQL"

### Paso 4: Configurar Variables

1. Click en tu servicio (web o api)
2. Ve a "Variables"
3. Agrega:

```
NODE_ENV=production
```

Railway ya configuró automáticamente `DATABASE_URL`.

### Paso 5: Ver tu App

1. Ve a "Settings" → "Domains"
2. Railway generó un dominio automático
3. Click en el dominio para ver tu app

---

## 📋 Variables de Entorno Necesarias

Railway configura automáticamente:
- ✅ `DATABASE_URL`
- ✅ `PGHOST`, `PGPORT`, etc.

Tú solo necesitas agregar:
```env
NODE_ENV=production
```

---

## 🔍 Verificar que Todo Funciona

Después del deploy, verifica:

### API Health Check
```
https://tu-dominio.railway.app/api/health
```

Debería responder: `{"status":"ok","database":"connected"}`

### Swagger Docs
```
https://tu-dominio.railway.app/docs
```

### Web App
```
https://tu-dominio.railway.app
```

### Showcase Premium
```
https://tu-dominio.railway.app/showcase
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Solución:**
```powershell
# Ejecutar migraciones manualmente
railway run npm run db:migrate:deploy
```

### Error: "Module not found"

**Solución:**
```powershell
# Limpiar y rebuild
railway run npm cache clean --force
railway up --detach
```

### Ver Logs

```powershell
railway logs
```

O en la web: Dashboard → tu servicio → Deployments → Click en deployment → Ver logs

---

## 💡 Tips Pro

### 1. Ver Variables de Entorno

```powershell
railway variables
```

### 2. Ejecutar Comandos Remotos

```powershell
railway run npm run db:seed
```

### 3. Conectar a la Base de Datos

```powershell
railway connect postgres
```

### 4. Ver Métricas

```powershell
railway status
```

### 5. Abrir Dashboard

```powershell
railway dashboard
```

---

## 🔄 Actualizar después de Cambios

Cada vez que hagas cambios:

### Si usas GitHub:
```powershell
git add .
git commit -m "Actualización del diseño"
git push
```
Railway detecta el push y redeploya automáticamente.

### Si usas CLI:
```powershell
railway up
```

---

## 💰 Costos Estimados

Railway cobra por uso:

- **Plan Hobby**: $5/mes de crédito incluido
- PostgreSQL: ~$5/mes
- App (Web + API): ~$3-8/mes

**Total estimado**: ~$8-13/mes

---

## 🎯 Próximos Pasos

Una vez desplegado:

1. ✅ Configura un dominio custom (opcional)
2. ✅ Configura notificaciones de deployment
3. ✅ Configura backups de DB (automáticos en Railway)
4. ✅ Monitorea logs y métricas
5. ✅ Comparte tu app con el mundo 🎉

---

## 📞 ¿Necesitas Ayuda?

- 📚 Docs: [docs.railway.app](https://docs.railway.app)
- 💬 Discord: [railway.app/discord](https://railway.app/discord)
- 📧 Support: help@railway.app

---

## ✅ Checklist Rápido

- [ ] Railway CLI instalado
- [ ] Login exitoso
- [ ] Proyecto inicializado
- [ ] PostgreSQL agregada
- [ ] App desplegada
- [ ] Health check funciona
- [ ] Web app cargando
- [ ] Showcase premium visible

---

**🎉 ¡Felicidades! Tu app premium está en producción.**

Comparte tu URL: `https://tu-app.railway.app`

---

**Tiempo total**: ~5-10 minutos
**Dificultad**: ⭐⭐☆☆☆
**Costo**: ~$8-13/mes

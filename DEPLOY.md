# 🚀 Guía de Despliegue en Render.com

Esta guía te ayudará a desplegar tanto el backend como el frontend de Trekking Chile en Render.com.

## 📋 Requisitos Previos

1. Cuenta en [Render.com](https://render.com) (gratuita)
2. Repositorio en GitHub, GitLab o Bitbucket con el código del proyecto
3. API Keys necesarias:
   - Gemini API Key (opcional pero recomendado)
   - Mapbox API Key (opcional, para fallback de geocodificación)

## 🔧 Ajustes Realizados en el Código

### Backend

- ✅ **CORS mejorado**: Configurado para permitir el frontend en producción usando la variable `FRONTEND_URL`
- ✅ **Puerto dinámico**: Usa `process.env.PORT` (Render lo configura automáticamente)
- ✅ **Health check**: Endpoint `/api/v1/health` disponible para Render

### Frontend

- ✅ **Variable de entorno**: Configurado para usar `VITE_API_BASE_URL`
- ✅ **Build optimizado**: Vite genera archivos estáticos optimizados

## 📝 Pasos para Desplegar

### Paso 1: Preparar el Repositorio

1. Asegúrate de que todos los cambios estén commiteados:
   ```bash
   git add .
   git commit -m "Preparar para despliegue en Render"
   git push
   ```

2. Verifica que el repositorio esté actualizado en GitHub/GitLab/Bitbucket

### Paso 2: Desplegar el Backend

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio (GitHub/GitLab/Bitbucket)
4. Selecciona el repositorio `trekking`
5. Configura el servicio:
   - **Name**: `trekking-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon` (o la más cercana a tus usuarios)
   - **Branch**: `main` (o tu rama principal)
   - **Root Directory**: `backend` (dejar vacío si el render.yaml está en la raíz)
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Plan**: `Free` (o el plan que prefieras)

6. **Variables de Entorno** - Agrega las siguientes:
   ```
   NODE_ENV=production
   PORT=10000
   NOMINATIM_USER_AGENT=TrekkingPlacesApp/1.0 (tu-email@ejemplo.com)
   NOMINATIM_ENABLED=true
   NOMINATIM_API_URL=https://nominatim.openstreetmap.org/search
   OVERPASS_API_URL=https://overpass-api.de/api/interpreter
   OVERPASS_TIMEOUT=30000
   GEMINI_API_KEY=tu_gemini_api_key_aqui
   MAPBOX_API_KEY=tu_mapbox_api_key_aqui (opcional)
   FRONTEND_URL=https://tu-frontend.onrender.com (se actualizará después)
   ```

7. Click en **"Create Web Service"**
8. Espera a que termine el build (puede tardar 5-10 minutos la primera vez)
9. **Anota la URL del backend** (ej: `https://trekking-backend.onrender.com`)

### Paso 3: Desplegar el Frontend

1. En Render Dashboard, click en **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio
3. Configura el servicio:
   - **Name**: `trekking-frontend`
   - **Branch**: `main` (o tu rama principal)
   - **Root Directory**: `frontend` (dejar vacío si el render.yaml está en la raíz)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. **Variables de Entorno** - Agrega:
   ```
   VITE_API_BASE_URL=https://trekking-backend.onrender.com/api/v1
   ```
   ⚠️ **Importante**: Reemplaza `trekking-backend` con el nombre real de tu servicio backend

5. Click en **"Create Static Site"**
6. Espera a que termine el build
7. **Anota la URL del frontend** (ej: `https://trekking-frontend.onrender.com`)

### Paso 4: Actualizar Variables de Entorno

1. Ve al servicio del **Backend** en Render Dashboard
2. Ve a la sección **"Environment"**
3. Actualiza la variable `FRONTEND_URL` con la URL completa del frontend:
   ```
   FRONTEND_URL=https://trekking-frontend.onrender.com
   ```
4. Guarda los cambios (esto reiniciará automáticamente el servicio)

### Paso 5: Verificar el Despliegue

#### Backend

1. **Health Check**: 
   ```
   https://tu-backend.onrender.com/api/v1/health
   ```
   Debe responder con `{"status":"ok"}`

2. **Swagger Documentation**:
   ```
   https://tu-backend.onrender.com/api/docs
   ```
   Debe mostrar la documentación de la API

3. **Endpoint de prueba**:
   ```
   https://tu-backend.onrender.com/api/v1/trekking-places?lat=-33.4489&lon=-70.6693&radius=50
   ```
   Debe retornar lugares de trekking

#### Frontend

1. Abre la URL del frontend en tu navegador
2. Verifica que la página cargue correctamente
3. Prueba hacer una búsqueda para verificar la conexión con el backend

## 🔍 Solución de Problemas

### Error: CORS bloqueado

**Síntoma**: El frontend no puede conectarse al backend, error de CORS en la consola del navegador.

**Solución**:
1. Verifica que `FRONTEND_URL` en el backend tenga la URL exacta del frontend (sin `/` al final)
2. Asegúrate de que la URL incluya `https://`
3. Reinicia el servicio del backend después de cambiar la variable

### Error: Backend no responde

**Síntoma**: El backend muestra error 503 o no responde.

**Solución**:
1. Revisa los logs en Render Dashboard → "Logs"
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que el build haya terminado correctamente

### Error: Frontend muestra "Cannot connect to API"

**Síntoma**: El frontend carga pero no puede hacer requests al backend.

**Solución**:
1. Verifica que `VITE_API_BASE_URL` tenga la URL correcta del backend
2. Asegúrate de incluir `/api/v1` al final de la URL
3. Verifica que el backend esté funcionando accediendo a `/api/v1/health`

### Servicios "dormidos" (Plan Gratuito)

**Síntoma**: El primer request después de un tiempo de inactividad tarda mucho.

**Explicación**: En el plan gratuito, Render "duerme" los servicios después de 15 minutos de inactividad. El primer request puede tardar 30-60 segundos en "despertar" el servicio.

**Solución**: 
- Considera usar un servicio de "ping" periódico para mantener el servicio activo
- O actualiza a un plan de pago para evitar el "sleep"

## 📊 Monitoreo

### Logs

- **Backend**: Render Dashboard → Tu servicio → "Logs"
- **Frontend**: Los logs del build están disponibles en la sección "Logs"

### Métricas

Render proporciona métricas básicas en el Dashboard:
- CPU usage
- Memory usage
- Request count
- Response times

## 🔐 Seguridad

### Variables Sensibles

⚠️ **NUNCA** subas archivos `.env` al repositorio. Todas las variables sensibles deben configurarse en Render Dashboard → Environment Variables.

### API Keys

- **Gemini API Key**: Obtén en [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Mapbox API Key**: Obtén en [Mapbox Account](https://account.mapbox.com/access-tokens/)

## 🚀 Optimizaciones Post-Despliegue

### 1. Configurar Dominio Personalizado (Opcional)

1. En Render Dashboard → Tu servicio → "Settings"
2. Scroll hasta "Custom Domains"
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones de Render

### 2. Habilitar HTTPS

Render proporciona HTTPS automáticamente para todos los servicios. No necesitas configuración adicional.

### 3. Configurar Auto-Deploy

Por defecto, Render despliega automáticamente cuando haces push a la rama principal. Puedes configurar esto en:
- Settings → "Auto-Deploy" → Selecciona la rama

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Render Pricing](https://render.com/pricing)
- [Render Status](https://status.render.com)

## ✅ Checklist de Despliegue

- [ ] Código commiteado y pusheado al repositorio
- [ ] Backend desplegado y funcionando
- [ ] Frontend desplegado y funcionando
- [ ] Variables de entorno configuradas correctamente
- [ ] CORS configurado con `FRONTEND_URL`
- [ ] Health check del backend responde OK
- [ ] Frontend puede conectarse al backend
- [ ] Pruebas funcionales completadas
- [ ] Logs revisados sin errores críticos

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en Render.com. Si encuentras algún problema, revisa la sección de "Solución de Problemas" o los logs en Render Dashboard.

# Guía de Despliegue - Backend en Render.com

Esta guía te ayudará a desplegar el backend de Trekking Chile API en Render.com paso a paso.

## 📋 Requisitos Previos

- Cuenta en [Render.com](https://render.com) (gratuita disponible)
- Repositorio Git (GitHub, GitLab o Bitbucket) con el código del backend
- API Keys necesarias (opcionales pero recomendadas):
  - Google Gemini API Key (para búsqueda inteligente)
  - Mapbox API Key (para geocodificación fallback)

## 🚀 Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en un repositorio Git y que el backend esté en la raíz o en una carpeta `backend/`:

```
tu-repositorio/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
└── ...
```

### 2. Crear un Nuevo Web Service en Render

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New +"** y selecciona **"Web Service"**
3. Conecta tu repositorio:
   - Si es la primera vez, autoriza Render para acceder a tu cuenta de GitHub/GitLab/Bitbucket
   - Selecciona el repositorio que contiene el backend

### 3. Configurar el Web Service

Completa los siguientes campos:

#### Información Básica

- **Name**: `trekking-backend` (o el nombre que prefieras)
- **Region**: Selecciona la región más cercana a tus usuarios (ej: `Oregon (US West)`)
- **Branch**: `main` (o la rama que uses para producción)
- **Root Directory**: `backend` (si el backend está en una subcarpeta, deja vacío si está en la raíz)

#### Configuración de Build y Start

- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

#### Variables de Entorno

Haz clic en **"Advanced"** y luego en **"Add Environment Variable"** para agregar las siguientes variables:

##### Variables Requeridas

```
NODE_ENV=production
PORT=10000
```

> **Nota**: Render asigna automáticamente el puerto mediante la variable `PORT`. El valor `10000` es un placeholder, Render lo reemplazará automáticamente.

##### Variables Opcionales (Recomendadas)

**Nominatim (OpenStreetMap) - Geocodificación gratuita:**
```
NOMINATIM_API_URL=https://nominatim.openstreetmap.org/search
NOMINATIM_USER_AGENT=TrekkingPlacesApp/1.0 (tu-email@ejemplo.com)
NOMINATIM_ENABLED=true
```

**Mapbox Geocoding API (Fallback opcional):**
```
MAPBOX_API_KEY=tu_api_key_de_mapbox
MAPBOX_API_URL=https://api.mapbox.com/geocoding/v5
```

**Google Gemini API (Para búsqueda inteligente):**
```
GEMINI_API_KEY=tu_api_key_de_gemini
GEMINI_MODEL=gemini-2.5-flash
```

**Overpass API (Configuración avanzada):**
```
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
OVERPASS_TIMEOUT=30000
```

**CORS (Configuración de orígenes permitidos):**
```
FRONTEND_URL=https://tu-frontend.onrender.com,https://tu-dominio.com
```

> **Importante**: Reemplaza `tu-email@ejemplo.com` con tu email real y las URLs del frontend con las URLs reales de tu aplicación frontend desplegada.

### 4. Configuración Avanzada (Opcional)

En la sección **"Advanced"**, puedes configurar:

- **Auto-Deploy**: `Yes` (para desplegar automáticamente en cada push)
- **Health Check Path**: `/api/v1/health`
- **Plan**: Selecciona el plan gratuito o el que prefieras

### 5. Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu aplicación
3. El proceso puede tardar varios minutos la primera vez
4. Puedes ver el progreso en tiempo real en los logs

### 6. Verificar el Despliegue

Una vez completado el despliegue:

1. Render te proporcionará una URL como: `https://trekking-backend.onrender.com`
2. Verifica que la API esté funcionando:
   ```bash
   curl https://tu-backend.onrender.com/api/v1/health
   ```
3. Accede a la documentación Swagger:
   ```
   https://tu-backend.onrender.com/api/docs
   ```

## 🔧 Configuración Post-Despliegue

### Actualizar Variables de Entorno

Para actualizar variables de entorno después del despliegue:

1. Ve a tu servicio en el Dashboard de Render
2. Haz clic en **"Environment"** en el menú lateral
3. Agrega, edita o elimina variables según necesites
4. Guarda los cambios - Render reiniciará automáticamente el servicio

### Configurar Dominio Personalizado (Opcional)

1. En el Dashboard de tu servicio, ve a **"Settings"**
2. Desplázate hasta **"Custom Domains"**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los registros DNS

## 📊 Monitoreo y Logs

- **Logs**: Accede a los logs en tiempo real desde el Dashboard de Render
- **Métricas**: Render proporciona métricas básicas de CPU, memoria y tráfico
- **Health Checks**: Render verifica automáticamente el endpoint `/api/v1/health`

## ⚠️ Consideraciones Importantes

### Plan Gratuito de Render

- **Sleep Mode**: Los servicios gratuitos se "duermen" después de 15 minutos de inactividad
- **Límites**: 750 horas/mes de tiempo de ejecución
- **Recomendación**: Para producción, considera el plan de pago para evitar el sleep mode

### Variables de Entorno Sensibles

- **Nunca** subas archivos `.env` al repositorio
- Usa las variables de entorno de Render para datos sensibles
- Las API Keys deben mantenerse seguras

### CORS

Asegúrate de configurar `FRONTEND_URL` con las URLs correctas de tu frontend desplegado para evitar problemas de CORS.

## 🔄 Actualizaciones Automáticas

Con **Auto-Deploy** habilitado, cada push a la rama `main` (o la rama configurada) desplegará automáticamente los cambios.

Para desplegar manualmente:

1. Ve al Dashboard de tu servicio
2. Haz clic en **"Manual Deploy"**
3. Selecciona la rama y commit que deseas desplegar

## 🐛 Solución de Problemas

### El servicio no inicia

- Verifica los logs en el Dashboard de Render
- Asegúrate de que el comando `start:prod` esté correcto
- Verifica que todas las variables de entorno requeridas estén configuradas

### Error de build

- Revisa los logs de build
- Verifica que `package.json` tenga el script `build` correcto
- Asegúrate de que todas las dependencias estén en `dependencies` y no en `devDependencies`

### Error 503 o timeout

- Verifica que el puerto esté configurado correctamente (Render usa la variable `PORT`)
- Asegúrate de que el servicio esté escuchando en `0.0.0.0` y no en `localhost`
- Revisa los logs para errores específicos

### Problemas de CORS

- Verifica que `FRONTEND_URL` esté configurado con las URLs correctas
- Asegúrate de que `NODE_ENV=production` esté configurado
- Revisa la configuración de CORS en `src/main.ts`

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Guía de Node.js en Render](https://render.com/docs/node-version)
- [Variables de Entorno en Render](https://render.com/docs/environment-variables)

## ✅ Checklist de Despliegue

- [ ] Repositorio conectado a Render
- [ ] Web Service creado
- [ ] Build command configurado: `npm install && npm run build`
- [ ] Start command configurado: `npm run start:prod`
- [ ] Variables de entorno configuradas
- [ ] Health check path configurado: `/api/v1/health`
- [ ] Despliegue completado exitosamente
- [ ] API accesible en la URL proporcionada
- [ ] Documentación Swagger accesible
- [ ] Health endpoint funcionando
- [ ] CORS configurado correctamente
- [ ] Frontend URL actualizada con la URL del backend

---

¡Tu backend debería estar funcionando en Render.com! 🎉

# Guía de Despliegue - Frontend en Render.com

Esta guía te ayudará a desplegar el frontend de Trekking Chile en Render.com como un sitio estático paso a paso.

## 📋 Requisitos Previos

- Cuenta en [Render.com](https://render.com) (gratuita disponible)
- Repositorio Git (GitHub, GitLab o Bitbucket) con el código del frontend
- Backend desplegado y funcionando (necesitarás su URL)

## 🚀 Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en un repositorio Git y que el frontend esté en la raíz o en una carpeta `frontend/`:

```
tu-repositorio/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
└── ...
```

### 2. Crear un Nuevo Static Site en Render

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New +"** y selecciona **"Static Site"**
3. Conecta tu repositorio:
   - Si es la primera vez, autoriza Render para acceder a tu cuenta de GitHub/GitLab/Bitbucket
   - Selecciona el repositorio que contiene el frontend

### 3. Configurar el Static Site

Completa los siguientes campos:

#### Información Básica

- **Name**: `trekking-frontend` (o el nombre que prefieras)
- **Region**: Selecciona la región más cercana a tus usuarios (ej: `Oregon (US West)`)
- **Branch**: `main` (o la rama que uses para producción)
- **Root Directory**: `frontend` (si el frontend está en una subcarpeta, deja vacío si está en la raíz)

#### Configuración de Build

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

> **Nota**: Vite genera los archivos estáticos en la carpeta `dist/` por defecto.

#### Variables de Entorno

Haz clic en **"Advanced"** y luego en **"Add Environment Variable"** para agregar:

```
VITE_API_BASE_URL=https://tu-backend.onrender.com/api/v1
```

> **Importante**: Reemplaza `https://tu-backend.onrender.com` con la URL real de tu backend desplegado en Render.

### 4. Configuración Avanzada (Opcional)

En la sección **"Advanced"**, puedes configurar:

- **Auto-Deploy**: `Yes` (para desplegar automáticamente en cada push)
- **Pull Request Previews**: `Yes` (para crear previews automáticos de PRs)
- **Plan**: Selecciona el plan gratuito o el que prefieras

### 5. Desplegar

1. Haz clic en **"Create Static Site"**
2. Render comenzará a construir y desplegar tu aplicación
3. El proceso puede tardar varios minutos la primera vez
4. Puedes ver el progreso en tiempo real en los logs

### 6. Verificar el Despliegue

Una vez completado el despliegue:

1. Render te proporcionará una URL como: `https://trekking-frontend.onrender.com`
2. Abre la URL en tu navegador
3. Verifica que la aplicación cargue correctamente
4. Prueba la funcionalidad de búsqueda para asegurarte de que la conexión con el backend funciona

## 🔧 Configuración Post-Despliegue

### Actualizar Variables de Entorno

Para actualizar variables de entorno después del despliegue:

1. Ve a tu sitio estático en el Dashboard de Render
2. Haz clic en **"Environment"** en el menú lateral
3. Agrega, edita o elimina variables según necesites
4. Guarda los cambios - Render reconstruirá automáticamente el sitio

> **Nota**: Las variables de entorno que comienzan con `VITE_` están disponibles en tiempo de build. Si cambias estas variables, necesitarás reconstruir el sitio.

### Configurar Dominio Personalizado (Opcional)

1. En el Dashboard de tu sitio, ve a **"Settings"**
2. Desplázate hasta **"Custom Domains"**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los registros DNS

### Configurar Redirects y Headers (Opcional)

Si necesitas configurar redirects o headers personalizados, crea un archivo `_redirects` en la carpeta `public/`:

```
# Redirects
/api/*  https://tu-backend.onrender.com/api/:splat  200

# Headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
```

## 📊 Monitoreo y Logs

- **Logs**: Accede a los logs de build en tiempo real desde el Dashboard de Render
- **Métricas**: Render proporciona métricas básicas de tráfico y ancho de banda
- **Deploy History**: Ve el historial de todos los despliegues

## ⚠️ Consideraciones Importantes

### Variables de Entorno en Vite

- Las variables de entorno deben comenzar con `VITE_` para estar disponibles en el código del frontend
- Estas variables se inyectan en tiempo de **build**, no en tiempo de ejecución
- Si cambias una variable de entorno, necesitarás reconstruir el sitio

### Configuración de la API

El frontend usa la variable `VITE_API_BASE_URL` para conectarse al backend. Asegúrate de:

1. Configurar esta variable con la URL completa del backend (incluyendo `/api/v1`)
2. Verificar que el backend tenga CORS configurado para permitir solicitudes desde tu dominio de Render

### Rutas del Frontend (SPA)

Si tu aplicación usa React Router con rutas del lado del cliente, necesitarás configurar redirects para que todas las rutas apunten a `index.html`. Render lo maneja automáticamente para sitios estáticos, pero puedes crear un archivo `_redirects` en `public/` si necesitas configuración personalizada:

```
/*    /index.html   200
```

## 🔄 Actualizaciones Automáticas

Con **Auto-Deploy** habilitado, cada push a la rama `main` (o la rama configurada) desplegará automáticamente los cambios.

Para desplegar manualmente:

1. Ve al Dashboard de tu sitio
2. Haz clic en **"Manual Deploy"**
3. Selecciona la rama y commit que deseas desplegar

### Pull Request Previews

Si habilitaste **Pull Request Previews**, Render creará automáticamente un sitio de preview para cada Pull Request, permitiéndote probar los cambios antes de fusionarlos.

## 🐛 Solución de Problemas

### El sitio no se construye correctamente

- Verifica los logs de build en el Dashboard de Render
- Asegúrate de que `package.json` tenga el script `build` correcto
- Verifica que todas las dependencias estén correctamente especificadas

### Error 404 en rutas del frontend

- Esto es común en SPAs (Single Page Applications)
- Render debería manejar esto automáticamente, pero si persiste, crea un archivo `_redirects` en `public/`:
  ```
  /*    /index.html   200
  ```

### La aplicación no se conecta al backend

- Verifica que `VITE_API_BASE_URL` esté configurada correctamente
- Asegúrate de que la URL incluya el protocolo (`https://`)
- Verifica que el backend tenga CORS configurado para permitir tu dominio de Render
- Revisa la consola del navegador para errores específicos

### Variables de entorno no funcionan

- Recuerda que las variables deben comenzar con `VITE_`
- Las variables se inyectan en tiempo de build, no en tiempo de ejecución
- Si cambias una variable, necesitas reconstruir el sitio

### Problemas de CORS

Si ves errores de CORS en la consola del navegador:

1. Verifica que el backend tenga `FRONTEND_URL` configurado con tu URL de Render
2. Asegúrate de que el backend esté en producción (`NODE_ENV=production`)
3. Verifica que la URL del frontend en `FRONTEND_URL` coincida exactamente (incluyendo `https://`)

## 🔐 Seguridad

### Variables de Entorno Sensibles

- **Nunca** subas archivos `.env` al repositorio
- Las variables de entorno en Render son seguras y no se exponen en el código del cliente
- Sin embargo, recuerda que las variables `VITE_*` se incluyen en el bundle final, así que no uses valores sensibles

### Headers de Seguridad

Considera agregar headers de seguridad creando un archivo `_headers` en `public/`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Guía de Static Sites en Render](https://render.com/docs/static-sites)
- [Documentación de Vite](https://vitejs.dev/)
- [Variables de Entorno en Vite](https://vitejs.dev/guide/env-and-mode.html)

## ✅ Checklist de Despliegue

- [ ] Repositorio conectado a Render
- [ ] Static Site creado
- [ ] Build command configurado: `npm install && npm run build`
- [ ] Publish directory configurado: `dist`
- [ ] Variable de entorno `VITE_API_BASE_URL` configurada con la URL del backend
- [ ] Despliegue completado exitosamente
- [ ] Sitio accesible en la URL proporcionada
- [ ] Aplicación carga correctamente
- [ ] Conexión con el backend funciona
- [ ] Rutas del frontend funcionan correctamente
- [ ] CORS configurado correctamente en el backend

## 🔗 Integración con el Backend

Una vez que ambos servicios estén desplegados:

1. **Backend URL**: `https://tu-backend.onrender.com`
2. **Frontend URL**: `https://tu-frontend.onrender.com`
3. **Configuración en Backend**: Asegúrate de que `FRONTEND_URL` en el backend incluya la URL del frontend:
   ```
   FRONTEND_URL=https://tu-frontend.onrender.com
   ```
4. **Configuración en Frontend**: Asegúrate de que `VITE_API_BASE_URL` apunte al backend:
   ```
   VITE_API_BASE_URL=https://tu-backend.onrender.com/api/v1
   ```

---

¡Tu frontend debería estar funcionando en Render.com! 🎉

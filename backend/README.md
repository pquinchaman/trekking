# Trekking Chile Backend API

Backend API desarrollado con NestJS para obtener información sobre lugares de trekking y senderismo en Chile.

## 🚀 Características

- **Integración con OpenStreetMap**: Utiliza Overpass API para obtener datos de senderos y lugares de trekking
- **Búsqueda flexible**: Busca por ubicación, radio, nombre y dificultad
- **Búsqueda inteligente con IA**: Procesa consultas en lenguaje natural usando Google Gemini API
- **Geocodificación inteligente**: Convierte nombres de lugares en coordenadas usando Nominatim (OpenStreetMap) como servicio principal y Mapbox como fallback opcional
- **Documentación Swagger**: API completamente documentada e interactiva
- **Validación de datos**: Validación automática de parámetros de entrada con class-validator
- **Manejo de errores**: Manejo robusto de errores y logging con interceptores
- **CORS configurable**: Soporte para múltiples orígenes frontend
- **TypeScript**: Código completamente tipado

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x

## 🔧 Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones. Las siguientes variables están disponibles:

### Variables Requeridas

- `PORT`: Puerto de la aplicación (default: 3000)
- `NODE_ENV`: Entorno de ejecución (`development` o `production`)

### Variables Opcionales

- **Nominatim (OpenStreetMap)** - Geocodificación gratuita (recomendado)
  - `NOMINATIM_API_URL`: URL de la API de Nominatim (default: https://nominatim.openstreetmap.org/search)
  - `NOMINATIM_USER_AGENT`: User-Agent personalizado (requerido por política de uso)
  - `NOMINATIM_ENABLED`: Habilitar/deshabilitar Nominatim (default: true)

- **Mapbox Geocoding API** - Fallback opcional para geocodificación
  - `MAPBOX_API_KEY`: Tu API Key de Mapbox
  - `MAPBOX_API_URL`: URL de la API (default: https://api.mapbox.com/geocoding/v5)
  - Plan gratuito: 100,000 solicitudes/mes
  - Obtén tu API Key en: https://account.mapbox.com/access-tokens/

- **Google Gemini API** - Para búsqueda inteligente con IA
  - `GEMINI_API_KEY`: Tu API Key de Google Gemini
  - `GEMINI_MODEL`: Modelo a utilizar (default: `gemini-2.5-flash`)
  - Modelos disponibles: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-3-flash-preview`, `gemini-3-pro-preview`
  - Obtén tu API Key en: https://makersuite.google.com/app/apikey

- **Overpass API** - Configuración avanzada
  - `OVERPASS_API_URL`: URL de la API de Overpass (default: https://overpass-api.de/api/interpreter)
  - `OVERPASS_TIMEOUT`: Timeout en milisegundos (default: 30000)

- **CORS** - Configuración de orígenes permitidos
  - `FRONTEND_URL`: URLs del frontend separadas por comas (ej: `http://localhost:5173,https://mi-dominio.com`)
  - En desarrollo, todos los orígenes están permitidos por defecto

## 🏃 Ejecución

### Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000`

### Producción

```bash
npm run build
npm run start:prod
```

## 📚 Documentación API

Una vez que la aplicación esté corriendo, accede a la documentación Swagger interactiva en:

```
http://localhost:3000/api/docs
```

La documentación incluye:
- Descripción detallada de todos los endpoints
- Parámetros disponibles y sus validaciones
- Ejemplos de respuestas
- Prueba interactiva de endpoints directamente desde el navegador

## ⚙️ Configuración

### CORS (Cross-Origin Resource Sharing)

La aplicación está configurada para permitir solicitudes desde diferentes orígenes:

- **Desarrollo**: Todos los orígenes están permitidos por defecto cuando `NODE_ENV=development`
- **Producción**: Solo los orígenes especificados en `FRONTEND_URL` están permitidos

Para configurar orígenes permitidos en producción, establece la variable de entorno:

```bash
FRONTEND_URL=http://localhost:5173,https://mi-dominio.com
```

Los orígenes deben estar separados por comas. Si no se especifica `FRONTEND_URL`, se usan los valores por defecto: `http://localhost:5173` y `http://localhost:3000`.

## 🔌 Endpoints

### GET /api/v1/trekking-places

Busca lugares de trekking y senderismo en Chile. Soporta búsqueda tradicional por parámetros o búsqueda inteligente con lenguaje natural usando IA.

**Parámetros de consulta:**

- `lat` (opcional): Latitud del punto central (-56.0 a -17.5)
- `lon` (opcional): Longitud del punto central (-75.6 a -66.4)
- `radius` (opcional): Radio de búsqueda en kilómetros (1-500, default: 50)
- `difficulty` (opcional): Nivel de dificultad (`easy`, `moderate`, `hard`, `expert`)
- `name` (opcional): Nombre del lugar o sendero
- `limit` (opcional): Límite de resultados (1-100, default: 20)
- `query` (opcional): Consulta en lenguaje natural para búsqueda inteligente con IA. Ej: "lugares fáciles cerca de Santiago con sombra"

**Ejemplos de uso:**

```bash
# Búsqueda tradicional: lugares cerca de Santiago
curl "http://localhost:3000/api/v1/trekking-places?lat=-33.4489&lon=-70.6693&radius=50"

# Búsqueda por nombre (geocodificación automática)
curl "http://localhost:3000/api/v1/trekking-places?name=Torres%20del%20Paine"

# Búsqueda por dificultad cerca de Valparaíso
curl "http://localhost:3000/api/v1/trekking-places?lat=-33.0472&lon=-71.6127&difficulty=easy"

# Búsqueda inteligente con lenguaje natural (requiere GEMINI_API_KEY)
curl "http://localhost:3000/api/v1/trekking-places?query=lugares%20fáciles%20cerca%20de%20Santiago%20con%20sombra"

# Combinación de parámetros
curl "http://localhost:3000/api/v1/trekking-places?name=Santiago&difficulty=moderate&radius=30&limit=10"
```

### GET /api/v1/health

Verifica el estado de la API.

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── common/          # Utilidades comunes
│   ├── config/          # Configuración
│   ├── modules/
│   │   ├── trekking-places/  # Módulo de lugares de trekking
│   │   │   ├── dto/          # Data Transfer Objects
│   │   │   ├── services/     # Servicios
│   │   │   ├── trekking-places.controller.ts
│   │   │   ├── trekking-places.service.ts
│   │   │   └── trekking-places.module.ts
│   │   └── health/           # Módulo de salud
│   ├── app.module.ts
│   └── main.ts
├── test/                # Tests
├── .env.example
├── package.json
└── tsconfig.json
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 📝 Scripts Disponibles

- `npm run build`: Compila el proyecto TypeScript a JavaScript
- `npm run start`: Inicia la aplicación compilada
- `npm run start:dev`: Inicia en modo desarrollo con hot-reload (recomendado para desarrollo)
- `npm run start:debug`: Inicia en modo debug con inspector de Node.js
- `npm run start:prod`: Inicia en modo producción (requiere build previo)
- `npm run lint`: Ejecuta ESLint y corrige errores automáticamente
- `npm run format`: Formatea el código con Prettier
- `npm run test`: Ejecuta tests unitarios
- `npm run test:watch`: Ejecuta tests en modo watch
- `npm run test:cov`: Genera reporte de cobertura de tests
- `npm run test:e2e`: Ejecuta tests end-to-end

## 🔍 Fuentes de Datos y Servicios

Este proyecto utiliza los siguientes servicios:

### Servicios Principales

- **OpenStreetMap - Overpass API**: Fuente principal de datos de senderos y lugares de trekking
  - Los datos son proporcionados por la comunidad de OpenStreetMap y están bajo licencia ODbL
  - Configurable mediante `OVERPASS_API_URL` y `OVERPASS_TIMEOUT`

- **Nominatim (OpenStreetMap)**: Servicio principal de geocodificación (gratuito)
  - Convierte nombres de lugares en coordenadas geográficas
  - No requiere API Key, pero es necesario configurar un User-Agent personalizado
  - Política de uso: https://operations.osmfoundation.org/policies/nominatim/
  - Configurable mediante `NOMINATIM_API_URL` y `NOMINATIM_USER_AGENT`

### Servicios Opcionales

- **Mapbox Geocoding API**: Servicio de geocodificación alternativo (fallback)
  - Se utiliza automáticamente si Nominatim falla o no encuentra resultados
  - Plan gratuito: 100,000 solicitudes/mes
  - Requiere API Key configurada en `MAPBOX_API_KEY`
  - Obtén tu API Key en: https://account.mapbox.com/access-tokens/

- **Google Gemini API**: Para procesamiento de lenguaje natural y búsqueda inteligente
  - Procesa consultas en lenguaje natural y genera recomendaciones personalizadas
  - Requiere API Key configurada en `GEMINI_API_KEY`
  - Sin esta API, la búsqueda inteligente con el parámetro `query` no estará disponible
  - Modelo por defecto: `gemini-2.5-flash` (configurable con `GEMINI_MODEL`)
  - Obtén tu API Key en: https://makersuite.google.com/app/apikey

## 📄 Licencia

MIT

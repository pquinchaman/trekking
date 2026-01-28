# Trekking Chile Backend API

Backend API desarrollado con NestJS para obtener información sobre lugares de trekking y senderismo en Chile.

## 🚀 Características

- **Integración con OpenStreetMap**: Utiliza Overpass API para obtener datos de senderos y lugares de trekking
- **Búsqueda flexible**: Busca por ubicación, radio, nombre y dificultad
- **Geocodificación inteligente**: Convierte nombres de lugares en coordenadas usando Google Maps API
- **Búsqueda con Inteligencia Artificial**: Procesa consultas en lenguaje natural y genera recomendaciones personalizadas
- **Documentación Swagger**: API completamente documentada
- **Validación de datos**: Validación automática de parámetros de entrada
- **Manejo de errores**: Manejo robusto de errores y logging
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

Editar `.env` con tus configuraciones. **Importante**: Para habilitar todas las características, necesitas:

- **Google Maps API Key** (opcional pero recomendado): Para geocodificación de nombres de lugares
  - Obtén tu API Key en: https://console.cloud.google.com/
  - Habilita la API de Geocoding en tu proyecto
  
- **Google Gemini API Key** (opcional pero recomendado): Para búsqueda inteligente con IA
  - Obtén tu API Key en: https://makersuite.google.com/app/apikey
  - El servicio funciona sin estas APIs, pero con funcionalidad limitada

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

Una vez que la aplicación esté corriendo, accede a la documentación Swagger en:

```
http://localhost:3000/api/docs
```

## 🔌 Endpoints

### GET /api/v1/trekking-places

Busca lugares de trekking y senderismo en Chile.

**Parámetros de consulta:**

- `lat` (opcional): Latitud del punto central (-56.0 a -17.5)
- `lon` (opcional): Longitud del punto central (-75.6 a -66.4)
- `radius` (opcional): Radio de búsqueda en kilómetros (1-500, default: 50)
- `difficulty` (opcional): Nivel de dificultad (easy, moderate, hard, expert)
- `name` (opcional): Nombre del lugar o sendero
- `limit` (opcional): Límite de resultados (1-100, default: 20)

**Ejemplo de uso:**

```bash
# Buscar lugares cerca de Santiago
curl "http://localhost:3000/api/v1/trekking-places?lat=-33.4489&lon=-70.6693&radius=50"

# Buscar lugares por nombre
curl "http://localhost:3000/api/v1/trekking-places?name=Torres%20del%20Paine"

# Buscar lugares fáciles cerca de Valparaíso
curl "http://localhost:3000/api/v1/trekking-places?lat=-33.0472&lon=-71.6127&difficulty=easy"
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

- `npm run build`: Compila el proyecto
- `npm run start`: Inicia la aplicación
- `npm run start:dev`: Inicia en modo desarrollo con hot-reload
- `npm run start:debug`: Inicia en modo debug
- `npm run start:prod`: Inicia en modo producción
- `npm run lint`: Ejecuta el linter
- `npm run format`: Formatea el código con Prettier

## 🔍 Fuentes de Datos y Servicios

Este proyecto utiliza:

- **OpenStreetMap**: A través de Overpass API para obtener datos de senderos y lugares de trekking
  - Los datos son proporcionados por la comunidad de OpenStreetMap y están bajo licencia ODbL
  
- **Google Maps Geocoding API** (opcional): Para convertir nombres de lugares en coordenadas
  - Requiere API Key configurada en `GOOGLE_MAPS_API_KEY`
  - Sin esta API, la geocodificación automática no estará disponible
  
- **Google Gemini API** (opcional): Para procesamiento de lenguaje natural y generación de recomendaciones
  - Requiere API Key configurada en `GEMINI_API_KEY`
  - Sin esta API, la búsqueda inteligente con IA no estará disponible
  - Modelo por defecto: `gemini-2.5-flash` (configurable con `GEMINI_MODEL`)

## 📄 Licencia

MIT

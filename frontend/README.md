# Frontend - Trekking Chile

Frontend desarrollado en React con TypeScript para la aplicación de búsqueda de lugares de trekking y senderismo en Chile.

## 🚀 Tecnologías

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **React Query (@tanstack/react-query)** - Manejo de estado del servidor y caché
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento
- **Heroicons** - Iconos

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── SearchForm.tsx
│   │   ├── TrekkingPlaceCard.tsx
│   │   ├── TrekkingPlacesList.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── pages/           # Páginas de la aplicación
│   │   └── HomePage.tsx
│   ├── hooks/           # Custom hooks
│   │   └── useTrekkingPlaces.ts
│   ├── services/        # Servicios API
│   │   └── trekkingPlacesService.ts
│   ├── config/          # Configuración
│   │   └── api.ts
│   ├── types/           # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables de entorno
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` y configurar la URL del backend:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## 🏃 Desarrollo

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## 🏗️ Build

Generar build de producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

## 📝 Características

- ✅ Búsqueda de lugares de trekking con filtros avanzados
- ✅ Interfaz responsive y moderna
- ✅ Manejo de estados de carga y errores
- ✅ Caché inteligente con React Query
- ✅ Tipado completo con TypeScript
- ✅ Componentes reutilizables y modulares
- ✅ Integración completa con el backend NestJS

## 🔧 Configuración

### Variables de Entorno

- `VITE_API_BASE_URL`: URL base del backend API (default: `http://localhost:3000/api/v1`)

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera el build de producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter

## 🎨 Estilos

El proyecto utiliza Tailwind CSS para los estilos. Los colores principales están configurados en `tailwind.config.js` con una paleta verde para el tema de trekking.

## 🔌 Integración con Backend

El frontend está configurado para comunicarse con el backend NestJS en:
- Endpoint base: `/api/v1`
- Endpoint de búsqueda: `/api/v1/trekking-places`

Asegúrate de que el backend esté corriendo antes de iniciar el frontend.

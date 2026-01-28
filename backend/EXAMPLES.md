# Ejemplos de Uso de la API

## Ejemplos con cURL

### 1. Buscar lugares cerca de Santiago

```bash
curl "http://localhost:3000/api/v1/trekking-places?lat=-33.4489&lon=-70.6693&radius=50&limit=10"
```

### 2. Buscar lugares por nombre

```bash
curl "http://localhost:3000/api/v1/trekking-places?name=Torres%20del%20Paine&limit=5"
```

### 3. Buscar lugares fáciles cerca de Valparaíso

```bash
curl "http://localhost:3000/api/v1/trekking-places?lat=-33.0472&lon=-71.6127&radius=30&difficulty=easy"
```

### 4. Buscar todos los lugares en Chile (sin filtros de ubicación)

```bash
curl "http://localhost:3000/api/v1/trekking-places?limit=50"
```

### 5. Búsqueda con geocodificación automática (por nombre de lugar)

```bash
# El sistema geocodificará automáticamente "Cajón del Maipo" a coordenadas
curl "http://localhost:3000/api/v1/trekking-places?name=Cajón%20del%20Maipo&radius=30"
```

### 6. Búsqueda inteligente con IA (lenguaje natural)

```bash
# Búsqueda usando lenguaje natural - la IA extrae parámetros automáticamente
curl "http://localhost:3000/api/v1/trekking-places?query=lugares%20fáciles%20cerca%20de%20Santiago"

# Búsqueda con características específicas
curl "http://localhost:3000/api/v1/trekking-places?query=sendero%20con%20vistas%20al%20mar%20cerca%20de%20Valparaíso"

# Búsqueda combinando IA con parámetros explícitos
curl "http://localhost:3000/api/v1/trekking-places?query=trekking%20moderado&difficulty=moderate&limit=10"
```

### 7. Verificar el estado de la API

```bash
curl "http://localhost:3000/api/v1/health"
```

## Ejemplos con JavaScript/TypeScript

### Usando fetch

```typescript
// Buscar lugares cerca de Santiago
const response = await fetch(
  'http://localhost:3000/api/v1/trekking-places?lat=-33.4489&lon=-70.6693&radius=50&limit=10'
);
const data = await response.json();
console.log(data);

// Buscar lugares por nombre
const searchResponse = await fetch(
  'http://localhost:3000/api/v1/trekking-places?name=Torres%20del%20Paine'
);
const searchData = await searchResponse.json();
console.log(searchData);
```

### Usando axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Búsqueda tradicional por coordenadas
const { data } = await api.get('/trekking-places', {
  params: {
    lat: -33.4489,
    lon: -70.6693,
    radius: 50,
    difficulty: 'moderate',
    limit: 20,
  },
});

console.log(data.places);

// Búsqueda con geocodificación automática
const geocodedSearch = await api.get('/trekking-places', {
  params: {
    name: 'Torres del Paine',
    radius: 50,
  },
});
console.log(geocodedSearch.data.places);

// Búsqueda inteligente con IA
const aiSearch = await api.get('/trekking-places', {
  params: {
    query: 'lugares fáciles cerca de Santiago con sombra',
    limit: 10,
  },
});
console.log(aiSearch.data.places);
console.log(aiSearch.data.aiRecommendation); // Recomendación generada por IA
```

## Respuesta de Ejemplo

### Respuesta estándar

```json
{
  "places": [
    {
      "id": "way_123456789",
      "name": "Sendero a la Laguna El Morado",
      "type": "hiking",
      "coordinates": {
        "lat": -33.4489,
        "lon": -70.6693
      },
      "description": "Sendero hacia la laguna El Morado en el Cajón del Maipo",
      "difficulty": "moderate",
      "distance": 10.5,
      "duration": 4,
      "elevation": 2500,
      "source": "OpenStreetMap",
      "osmUrl": "https://www.openstreetmap.org/way/123456789"
    }
  ],
  "total": 1,
  "limit": 20
}
```

### Respuesta con recomendación de IA (cuando se usa el parámetro `query`)

```json
{
  "places": [
    {
      "id": "way_123456789",
      "name": "Sendero a la Laguna El Morado",
      "type": "hiking",
      "coordinates": {
        "lat": -33.4489,
        "lon": -70.6693
      },
      "description": "Sendero hacia la laguna El Morado en el Cajón del Maipo",
      "difficulty": "easy",
      "distance": 5.2,
      "duration": 2,
      "elevation": 1500,
      "source": "OpenStreetMap",
      "osmUrl": "https://www.openstreetmap.org/way/123456789"
    }
  ],
  "total": 1,
  "limit": 20,
  "aiRecommendation": "Encontré excelentes opciones de senderos fáciles cerca de Santiago. El Sendero a la Laguna El Morado es perfecto para familias, con una distancia moderada de 5.2 km y vistas impresionantes. Te recomiendo llevar agua y protección solar."
}
```

## Parámetros Disponibles

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `lat` | number | Latitud del punto central (-56.0 a -17.5) | -33.4489 |
| `lon` | number | Longitud del punto central (-75.6 a -66.4) | -70.6693 |
| `radius` | number | Radio de búsqueda en km (1-500) | 50 |
| `difficulty` | string | Nivel de dificultad (easy, moderate, hard, expert) | moderate |
| `name` | string | Nombre del lugar o sendero (se geocodifica si no hay coordenadas) | "Torres del Paine" |
| `query` | string | Consulta en lenguaje natural para búsqueda inteligente con IA | "lugares fáciles cerca de Santiago" |
| `limit` | number | Límite de resultados (1-100) | 20 |

## Características Avanzadas

### Geocodificación Automática

Cuando proporcionas un `name` sin coordenadas (`lat`/`lon`), el sistema intentará geocodificarlo automáticamente usando Google Maps API. Esto permite buscar lugares usando solo su nombre:

```bash
# El sistema buscará "Cajón del Maipo" y lo convertirá en coordenadas automáticamente
curl "http://localhost:3000/api/v1/trekking-places?name=Cajón%20del%20Maipo&radius=30"
```

**Nota**: Requiere `GOOGLE_MAPS_API_KEY` configurada en las variables de entorno.

### Búsqueda Inteligente con IA

El parámetro `query` permite hacer consultas en lenguaje natural. La IA procesa la consulta y:

1. Extrae parámetros de búsqueda (nombre del lugar, dificultad, características)
2. Genera recomendaciones personalizadas basadas en los resultados

Ejemplos de consultas válidas:
- "lugares fáciles cerca de Santiago"
- "sendero con vistas al mar cerca de Valparaíso"
- "trekking moderado con agua y sombra"
- "lugares para niños en el Cajón del Maipo"

**Nota**: Requiere `GEMINI_API_KEY` configurada en las variables de entorno.

### Combinación de Parámetros

Puedes combinar parámetros explícitos con búsqueda inteligente. Los parámetros explícitos tienen prioridad:

```bash
# La IA procesará la query, pero se aplicará el filtro de dificultad explícito
curl "http://localhost:3000/api/v1/trekking-places?query=lugares%20cerca%20de%20Santiago&difficulty=easy&limit=10"
```

## Coordenadas de Referencia de Ciudades en Chile

- **Santiago**: lat=-33.4489, lon=-70.6693
- **Valparaíso**: lat=-33.0472, lon=-71.6127
- **Concepción**: lat=-36.8201, lon=-73.0444
- **La Serena**: lat=-29.9027, lon=-71.2519
- **Puerto Montt**: lat=-41.4718, lon=-72.9369
- **Punta Arenas**: lat=-53.1638, lon=-70.9171

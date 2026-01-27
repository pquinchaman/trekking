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

### 5. Verificar el estado de la API

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

// Buscar lugares
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
```

## Respuesta de Ejemplo

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

## Parámetros Disponibles

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `lat` | number | Latitud del punto central (-56.0 a -17.5) | -33.4489 |
| `lon` | number | Longitud del punto central (-75.6 a -66.4) | -70.6693 |
| `radius` | number | Radio de búsqueda en km (1-500) | 50 |
| `difficulty` | string | Nivel de dificultad (easy, moderate, hard, expert) | moderate |
| `name` | string | Nombre del lugar o sendero | "Torres del Paine" |
| `limit` | number | Límite de resultados (1-100) | 20 |

## Coordenadas de Referencia de Ciudades en Chile

- **Santiago**: lat=-33.4489, lon=-70.6693
- **Valparaíso**: lat=-33.0472, lon=-71.6127
- **Concepción**: lat=-36.8201, lon=-73.0444
- **La Serena**: lat=-29.9027, lon=-71.2519
- **Puerto Montt**: lat=-41.4718, lon=-72.9369
- **Punta Arenas**: lat=-53.1638, lon=-70.9171

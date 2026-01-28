import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SearchTrekkingPlacesDto } from '../dto/search-trekking-places.dto';
import { TrekkingPlaceResponseDto } from '../dto/trekking-place-response.dto';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    [key: string]: string;
  };
  geometry?: Array<{ lat: number; lon: number }>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

@Injectable()
export class OverpassService {
  private readonly logger = new Logger(OverpassService.name);
  private readonly apiUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number = 2;
  private readonly retryDelay: number = 1000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('overpass.apiUrl');
    this.timeout = this.configService.get<number>('overpass.timeout');
  }

  async searchTrekkingPlaces(
    searchDto: SearchTrekkingPlacesDto,
  ): Promise<TrekkingPlaceResponseDto[]> {
    const query = this.buildOverpassQuery(searchDto);
    this.logger.debug(`Ejecutando consulta Overpass: ${query.substring(0, 200)}...`);

    // Timeout más corto para Overpass (25 segundos máximo recomendado)
    const overpassTimeout = Math.min(Math.floor(this.timeout / 1000), 25);
    
    let lastError: Error;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          this.logger.warn(`Reintentando consulta Overpass (intento ${attempt + 1}/${this.maxRetries + 1}) después de ${delay}ms...`);
          await this.sleep(delay);
        }

        const response = await firstValueFrom(
          this.httpService.post<OverpassResponse>(
            this.apiUrl,
            `[out:json][timeout:${overpassTimeout}];${query}`,
            {
              headers: {
                'Content-Type': 'text/plain',
              },
              timeout: this.timeout,
            },
          ),
        );

        this.logger.debug(`Consulta Overpass exitosa. Elementos recibidos: ${response.data.elements?.length || 0}`);
        return this.transformOverpassResponse(response.data.elements, searchDto);
      } catch (error: any) {
        lastError = error;
        const isTimeout = error?.response?.status === 504 || error?.code === 'ECONNABORTED';
        const isRetryable = isTimeout || (error?.response?.status >= 500);
        
        if (!isRetryable || attempt === this.maxRetries) {
          this.logger.error(
            `Error al consultar Overpass API (intento ${attempt + 1}/${this.maxRetries + 1}): ${error?.message || 'Error desconocido'}`,
            error?.stack,
          );
          break;
        }
        
        this.logger.warn(`Error temporal en consulta Overpass: ${error?.message || 'Error desconocido'}. Reintentando...`);
      }
    }

    // Si es un timeout, proporcionar un mensaje más específico
    if (lastError && (lastError as any)?.response?.status === 504) {
      throw new HttpException(
        'La consulta está tardando demasiado. Intenta reducir el radio de búsqueda o especificar un nombre.',
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    throw new HttpException(
      'Error al obtener lugares de trekking desde OpenStreetMap',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildOverpassQuery(searchDto: SearchTrekkingPlacesDto): string {
    const { lat, lon, radius = 50, name } = searchDto;
    const chileBounds = this.configService.get('chile.bounds');

    // Si se proporcionan coordenadas específicas, buscar alrededor de ese punto
    if (lat && lon) {
      return this.buildRadiusQuery(lat, lon, radius, name);
    }

    // Si no, buscar en todo Chile
    return this.buildChileQuery(name);
  }

  private buildRadiusQuery(lat: number, lon: number, radius: number, name?: string): string {
    const radiusInMeters = radius * 1000;
    
    // Si hay nombre, usar filtro de nombre; si no, omitirlo para mejorar rendimiento
    const nameFilter = name ? `["name"~"${name}",i]` : '';
    
    let query = `(
      way["leisure"="nature_reserve"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
      way["natural"="peak"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
      way["tourism"="attraction"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
      relation["route"="hiking"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
      way["route"="hiking"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
      way["highway"="path"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
      way["highway"="footway"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
      node["tourism"="attraction"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
      node["natural"="peak"]${nameFilter}(around:${radiusInMeters},${lat},${lon});
    );`;

    // Usar out center para obtener el centro directamente (más eficiente que calcularlo)
    // Limitar a 1000 elementos para evitar timeouts
    query += 'out center 1000;';
    return query;
  }

  private buildChileQuery(name?: string): string {
    const bounds = this.configService.get('chile.bounds');
    const nameFilter = name ? `["name"~"${name}",i]` : '';

    let query = `(
      way["leisure"="nature_reserve"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["natural"="peak"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["tourism"="attraction"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      relation["route"="hiking"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["route"="hiking"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["highway"="path"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["highway"="footway"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["tourism"="attraction"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      node["natural"="peak"]${nameFilter}(${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
    );`;

    // Limitar a 1000 elementos para evitar timeouts
    query += 'out center 1000;';
    return query;
  }

  private transformOverpassResponse(
    elements: OverpassElement[],
    searchDto: SearchTrekkingPlacesDto,
  ): TrekkingPlaceResponseDto[] {
    const places: TrekkingPlaceResponseDto[] = [];

    for (const element of elements) {
      const place = this.transformElement(element);
      if (place) {
        places.push(place);
      }
    }

    // Aplicar filtro de dificultad si se especifica
    let filteredPlaces = places;
    if (searchDto.difficulty) {
      filteredPlaces = this.filterByDifficulty(places, searchDto.difficulty);
    }

    // Limitar resultados
    const limit = searchDto.limit || 20;
    return filteredPlaces.slice(0, limit);
  }

  private transformElement(element: OverpassElement): TrekkingPlaceResponseDto | null {
    const tags = element.tags || {};
    const name = tags.name || tags['name:es'] || 'Sin nombre';

    // Obtener coordenadas
    // Con 'out center', Overpass puede devolver coordenadas de diferentes formas:
    // - Nodes: directamente en lat/lon
    // - Ways/Relations: en el campo 'center' o directamente en lat/lon
    let lat: number, lon: number;
    
    if (element.lat && element.lon) {
      // Caso más común: coordenadas directas (nodes o ways/relations con out center)
      lat = element.lat;
      lon = element.lon;
    } else if (element.center?.lat && element.center?.lon) {
      // Caso alternativo: coordenadas en el campo center
      lat = element.center.lat;
      lon = element.center.lon;
    } else if (element.geometry && element.geometry.length > 0) {
      // Fallback: calcular centro desde geometría
      const center = this.calculateCenter(element.geometry);
      lat = center.lat;
      lon = center.lon;
    } else {
      // Sin coordenadas disponibles
      return null;
    }

    // Determinar tipo
    const type = this.determineType(tags);

    // Extraer información adicional
    const description = tags.description || tags['description:es'] || tags.note || '';
    const distance = tags.distance ? parseFloat(tags.distance) : undefined;
    const duration = tags.duration ? parseFloat(tags.duration) : undefined;
    const elevation = tags.ele ? parseFloat(tags.ele) : undefined;

    // Determinar dificultad basada en tags
    const difficulty = this.determineDifficulty(tags);

    return {
      id: `${element.type}_${element.id}`,
      name,
      type,
      coordinates: { lat, lon },
      description: description || undefined,
      difficulty,
      distance,
      duration,
      elevation,
      source: 'OpenStreetMap',
      osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    };
  }

  private calculateCenter(geometry: Array<{ lat: number; lon: number }>): { lat: number; lon: number } {
    if (geometry.length === 0) {
      return { lat: 0, lon: 0 };
    }

    const sum = geometry.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat,
        lon: acc.lon + point.lon,
      }),
      { lat: 0, lon: 0 },
    );

    return {
      lat: sum.lat / geometry.length,
      lon: sum.lon / geometry.length,
    };
  }

  private determineType(tags: { [key: string]: string }): string {
    if (tags.route === 'hiking') return 'hiking';
    if (tags.leisure === 'nature_reserve') return 'nature_reserve';
    if (tags.natural === 'peak') return 'peak';
    if (tags.tourism === 'attraction') return 'attraction';
    if (tags.highway === 'path' || tags.highway === 'footway') return 'trail';
    return 'place';
  }

  private determineDifficulty(tags: { [key: string]: string }): string | undefined {
    const sacScale = tags['sac_scale'];
    if (sacScale) {
      if (sacScale.includes('hiking') || sacScale === 'T1') return 'easy';
      if (sacScale === 'T2' || sacScale === 'T3') return 'moderate';
      if (sacScale === 'T4' || sacScale === 'T5') return 'hard';
      if (sacScale === 'T6') return 'expert';
    }

    const difficulty = tags.difficulty?.toLowerCase();
    if (difficulty) {
      if (difficulty.includes('easy') || difficulty === 'fácil') return 'easy';
      if (difficulty.includes('moderate') || difficulty === 'moderado') return 'moderate';
      if (difficulty.includes('hard') || difficulty === 'difícil') return 'hard';
      if (difficulty.includes('expert') || difficulty === 'experto') return 'expert';
    }

    return undefined;
  }

  private filterByDifficulty(
    places: TrekkingPlaceResponseDto[],
    difficulty: string,
  ): TrekkingPlaceResponseDto[] {
    return places.filter((place) => place.difficulty === difficulty);
  }
}

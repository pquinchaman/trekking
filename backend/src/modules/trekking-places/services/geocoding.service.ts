import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface GeocodingResult {
  lat: number;
  lon: number;
  formattedAddress: string;
  placeId?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
  boundingbox: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
}

interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    [key: string]: any;
  };
  text: string;
  place_name: string;
  center: [number, number]; // [lon, lat]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    [key: string]: any;
  }>;
}

interface MapboxResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimUrl: string;
  private readonly userAgent: string;
  private readonly mapboxApiKey: string;
  private readonly mapboxApiUrl: string;
  private readonly nominatimEnabled: boolean;
  private readonly mapboxEnabled: boolean;
  private readonly chileBounds = {
    minLat: -56.0,
    maxLat: -17.5,
    minLon: -75.6,
    maxLon: -66.4,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.nominatimUrl =
      this.configService.get<string>('nominatim.apiUrl') ||
      'https://nominatim.openstreetmap.org/search';
    // User-Agent es requerido por la política de uso de Nominatim
    this.userAgent =
      this.configService.get<string>('nominatim.userAgent') ||
      'TrekkingPlacesApp/1.0 (contact@example.com)';
    
    // Configuración de Mapbox
    this.mapboxApiKey = this.configService.get<string>('mapbox.apiKey') || '';
    this.mapboxApiUrl =
      this.configService.get<string>('mapbox.apiUrl') ||
      'https://api.mapbox.com/geocoding/v5';
    
    // Verificar qué servicios están habilitados
    this.nominatimEnabled =
      this.configService.get<boolean>('nominatim.enabled') !== false;
    this.mapboxEnabled = !!this.mapboxApiKey && 
      this.configService.get<boolean>('mapbox.enabled') !== false;
    
    this.logger.log(
      `Geocoding Service inicializado - Nominatim: ${this.nominatimEnabled ? 'habilitado' : 'deshabilitado'}, Mapbox: ${this.mapboxEnabled ? 'habilitado' : 'deshabilitado'}`,
    );
  }

  /**
   * Geocodifica un nombre de lugar a coordenadas usando estrategia híbrida:
   * 1. Intenta con Nominatim (gratis)
   * 2. Si falla, usa Mapbox como fallback (si está configurado)
   * @param placeName Nombre del lugar (ej: "Cajón del Maipo", "Torres del Paine")
   * @returns Coordenadas y dirección formateada
   */
  async geocode(placeName: string): Promise<GeocodingResult> {
    // Intentar primero con Nominatim si está habilitado
    if (this.nominatimEnabled) {
      try {
        return await this.geocodeWithNominatim(placeName);
      } catch (error) {
        // Si Nominatim falla y Mapbox está disponible, usar fallback
        if (this.mapboxEnabled && error instanceof HttpException) {
          this.logger.warn(
            `Nominatim falló para "${placeName}", intentando con Mapbox...`,
          );
          try {
            return await this.geocodeWithMapbox(placeName);
          } catch (mapboxError) {
            // Si ambos fallan, lanzar el error original de Nominatim
            throw error;
          }
        }
        // Si Mapbox no está disponible, lanzar el error de Nominatim
        throw error;
      }
    }

    // Si Nominatim no está habilitado pero Mapbox sí, usar Mapbox directamente
    if (this.mapboxEnabled) {
      return await this.geocodeWithMapbox(placeName);
    }

    // Si ningún servicio está disponible
    throw new HttpException(
      'Ningún servicio de geocodificación está configurado',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * Geocodifica usando Nominatim (OpenStreetMap)
   * @param placeName Nombre del lugar
   * @returns Coordenadas y dirección formateada
   * @private
   */
  private async geocodeWithNominatim(placeName: string): Promise<GeocodingResult> {
    try {
      this.logger.debug(`Geocodificando lugar con Nominatim: ${placeName}`);

      // Agregar "Chile" al final para mejorar la precisión
      const searchQuery = placeName.includes('Chile')
        ? placeName
        : `${placeName}, Chile`;

      // Construir parámetros de búsqueda para limitar a Chile
      const params = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        limit: '10',
        countrycodes: 'cl', // Limitar a Chile
        addressdetails: '1',
        // Bounding box para Chile (south, north, west, east)
        viewbox: `${this.chileBounds.minLon},${this.chileBounds.maxLat},${this.chileBounds.maxLon},${this.chileBounds.minLat}`,
        bounded: '1', // Solo resultados dentro del bounding box
      });

      const response = await firstValueFrom(
        this.httpService.get<NominatimResult[]>(
          `${this.nominatimUrl}?${params.toString()}`,
          {
            headers: {
              'User-Agent': this.userAgent,
            },
            timeout: 10000,
          },
        ),
      );

      if (!response.data || response.data.length === 0) {
        this.logger.warn(`No se encontraron resultados para: ${placeName}`);
        throw new HttpException(
          `No se pudo encontrar el lugar: ${placeName}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Filtrar resultados que estén dentro de los límites de Chile
      const chileResults = response.data.filter((result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        return (
          lat >= this.chileBounds.minLat &&
          lat <= this.chileBounds.maxLat &&
          lon >= this.chileBounds.minLon &&
          lon <= this.chileBounds.maxLon
        );
      });

      if (chileResults.length === 0) {
        this.logger.warn(
          `No se encontraron resultados en Chile para: ${placeName}`,
        );
        throw new HttpException(
          `No se encontró el lugar "${placeName}" en Chile`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Tomar el primer resultado (más relevante según Nominatim)
      const result = chileResults[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      this.logger.debug(
        `Geocodificación exitosa: ${placeName} -> (${lat}, ${lon})`,
      );

      return {
        lat,
        lon,
        formattedAddress: result.display_name,
        placeId: result.place_id.toString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Error al geocodificar "${placeName}": ${error.message}`,
        error.stack,
      );

      // Manejar errores específicos de Nominatim
      if (error.response?.status === 429) {
        throw new HttpException(
          'Demasiadas solicitudes a Nominatim. Por favor, espere un momento.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        `Error al geocodificar el lugar: ${placeName}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Geocodifica usando Mapbox Geocoding API
   * @param placeName Nombre del lugar
   * @returns Coordenadas y dirección formateada
   * @private
   */
  private async geocodeWithMapbox(placeName: string): Promise<GeocodingResult> {
    try {
      this.logger.debug(`Geocodificando lugar con Mapbox: ${placeName}`);

      // Agregar "Chile" al final para mejorar la precisión
      const searchQuery = placeName.includes('Chile')
        ? placeName
        : `${placeName}, Chile`;

      // Construir URL para Mapbox Geocoding API
      // Formato: /mapbox.places/{query}.json
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `${this.mapboxApiUrl}/mapbox.places/${encodedQuery}.json`;

      // Parámetros para limitar búsqueda a Chile
      const params = new URLSearchParams({
        access_token: this.mapboxApiKey,
        country: 'cl', // Limitar a Chile
        limit: '10',
        // Bounding box para Chile (minLon, minLat, maxLon, maxLat)
        bbox: `${this.chileBounds.minLon},${this.chileBounds.minLat},${this.chileBounds.maxLon},${this.chileBounds.maxLat}`,
        types: 'place,poi,address', // Tipos de lugares relevantes
      });

      const response = await firstValueFrom(
        this.httpService.get<MapboxResponse>(`${url}?${params.toString()}`, {
          timeout: 10000,
        }),
      );

      if (
        !response.data ||
        !response.data.features ||
        response.data.features.length === 0
      ) {
        this.logger.warn(`No se encontraron resultados en Mapbox para: ${placeName}`);
        throw new HttpException(
          `No se pudo encontrar el lugar: ${placeName}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Filtrar resultados que estén dentro de los límites de Chile
      const chileFeatures = response.data.features.filter((feature) => {
        const [lon, lat] = feature.center;
        return (
          lat >= this.chileBounds.minLat &&
          lat <= this.chileBounds.maxLat &&
          lon >= this.chileBounds.minLon &&
          lon <= this.chileBounds.maxLon
        );
      });

      if (chileFeatures.length === 0) {
        this.logger.warn(
          `No se encontraron resultados en Chile (Mapbox) para: ${placeName}`,
        );
        throw new HttpException(
          `No se encontró el lugar "${placeName}" en Chile`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Tomar el primer resultado (más relevante según Mapbox)
      const feature = chileFeatures[0];
      const [lon, lat] = feature.center;

      this.logger.debug(
        `Geocodificación exitosa con Mapbox: ${placeName} -> (${lat}, ${lon})`,
      );

      return {
        lat,
        lon,
        formattedAddress: feature.place_name,
        placeId: feature.id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Error al geocodificar con Mapbox "${placeName}": ${error.message}`,
        error.stack,
      );

      // Manejar errores específicos de Mapbox
      if (error.response?.status === 401) {
        throw new HttpException(
          'API Key de Mapbox inválida o no autorizada',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (error.response?.status === 429) {
        throw new HttpException(
          'Demasiadas solicitudes a Mapbox. Por favor, espere un momento.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        `Error al geocodificar el lugar con Mapbox: ${placeName}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifica si el servicio está disponible
   * Retorna true si al menos uno de los servicios está habilitado
   */
  isAvailable(): boolean {
    return this.nominatimEnabled || this.mapboxEnabled;
  }
}

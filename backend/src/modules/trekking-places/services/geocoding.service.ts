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

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimUrl: string;
  private readonly userAgent: string;
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
  }

  /**
   * Geocodifica un nombre de lugar a coordenadas usando Nominatim (OpenStreetMap)
   * @param placeName Nombre del lugar (ej: "Cajón del Maipo", "Torres del Paine")
   * @returns Coordenadas y dirección formateada
   */
  async geocode(placeName: string): Promise<GeocodingResult> {
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
   * Verifica si el servicio está disponible
   * Nominatim siempre está disponible (no requiere API key)
   */
  isAvailable(): boolean {
    return true;
  }
}

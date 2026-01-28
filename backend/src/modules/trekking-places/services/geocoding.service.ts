import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@googlemaps/google-maps-services-js';

export interface GeocodingResult {
  lat: number;
  lon: number;
  formattedAddress: string;
  placeId?: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly client: Client;
  private readonly apiKey: string;
  private readonly chileBounds = {
    minLat: -56.0,
    maxLat: -17.5,
    minLon: -75.6,
    maxLon: -66.4,
  };

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('googleMaps.apiKey');
    this.client = new Client({});
  }

  /**
   * Geocodifica un nombre de lugar a coordenadas
   * @param placeName Nombre del lugar (ej: "Cajón del Maipo", "Torres del Paine")
   * @returns Coordenadas y dirección formateada
   */
  async geocode(placeName: string): Promise<GeocodingResult> {
    if (!this.apiKey) {
      this.logger.warn('Google Maps API Key no configurada. La geocodificación no estará disponible.');
      throw new HttpException(
        'Servicio de geocodificación no configurado. Configure GOOGLE_MAPS_API_KEY.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      this.logger.debug(`Geocodificando lugar: ${placeName}`);

      // Agregar "Chile" al final para mejorar la precisión
      const searchQuery = placeName.includes('Chile') ? placeName : `${placeName}, Chile`;

      const response = await this.client.geocode({
        params: {
          address: searchQuery,
          key: this.apiKey,
          region: 'cl',
          bounds: {
            northeast: {
              lat: this.chileBounds.maxLat,
              lng: this.chileBounds.maxLon,
            },
            southwest: {
              lat: this.chileBounds.minLat,
              lng: this.chileBounds.minLon,
            },
          },
        },
      });

      if (!response.data.results || response.data.results.length === 0) {
        this.logger.warn(`No se encontraron resultados para: ${placeName}`);
        throw new HttpException(
          `No se pudo encontrar el lugar: ${placeName}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Filtrar resultados que estén dentro de Chile
      const chileResults = response.data.results.filter((result) => {
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        return (
          lat >= this.chileBounds.minLat &&
          lat <= this.chileBounds.maxLat &&
          lng >= this.chileBounds.minLon &&
          lng <= this.chileBounds.maxLon
        );
      });

      if (chileResults.length === 0) {
        this.logger.warn(`No se encontraron resultados en Chile para: ${placeName}`);
        throw new HttpException(
          `No se encontró el lugar "${placeName}" en Chile`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Tomar el primer resultado (más relevante)
      const result = chileResults[0];
      const location = result.geometry.location;

      this.logger.debug(
        `Geocodificación exitosa: ${placeName} -> (${location.lat}, ${location.lng})`,
      );

      return {
        lat: location.lat,
        lon: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Error al geocodificar "${placeName}": ${error.message}`,
        error.stack,
      );

      if (error.response?.status === 403) {
        throw new HttpException(
          'Error de autenticación con Google Maps API. Verifique su API Key.',
          HttpStatus.FORBIDDEN,
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
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

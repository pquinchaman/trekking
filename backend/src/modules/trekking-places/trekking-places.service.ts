import { Injectable, Logger } from '@nestjs/common';
import { OverpassService } from './services/overpass.service';
import { GeocodingService } from './services/geocoding.service';
import { AIService } from './services/ai.service';
import { SearchTrekkingPlacesDto } from './dto/search-trekking-places.dto';
import { TrekkingPlaceResponseDto, TrekkingPlacesResponseDto } from './dto/trekking-place-response.dto';

@Injectable()
export class TrekkingPlacesService {
  private readonly logger = new Logger(TrekkingPlacesService.name);

  constructor(
    private readonly overpassService: OverpassService,
    private readonly geocodingService: GeocodingService,
    private readonly aiService: AIService,
  ) {}

  async searchPlaces(searchDto: SearchTrekkingPlacesDto): Promise<TrekkingPlacesResponseDto> {
    this.logger.log(`Buscando lugares de trekking con parámetros: ${JSON.stringify(searchDto)}`);

    let finalSearchDto = { ...searchDto };

    // Si hay una consulta en lenguaje natural, procesarla con IA
    if (searchDto.query && this.aiService.isAvailable()) {
      try {
        this.logger.log(`Procesando consulta en lenguaje natural: "${searchDto.query}"`);
        const aiRecommendation = await this.aiService.processNaturalLanguageQuery({
          query: searchDto.query,
          userPreferences: {
            difficulty: searchDto.difficulty,
          },
        });

        this.logger.debug(`IA recomendó: ${JSON.stringify(aiRecommendation.searchParams)}`);

        // Combinar parámetros de IA con los parámetros explícitos (los explícitos tienen prioridad)
        finalSearchDto = {
          ...aiRecommendation.searchParams,
          ...searchDto,
          query: searchDto.query, // Mantener la query original para generar recomendaciones después
        } as SearchTrekkingPlacesDto;
      } catch (error) {
        this.logger.warn(
          `Error al procesar consulta con IA (todos los proveedores): ${error.message}. Continuando con búsqueda tradicional.`,
        );
        // Continuar con la búsqueda normal si falla la IA
      }
    }

    // Si hay un nombre pero no coordenadas, intentar geocodificar
    if (finalSearchDto.name && !finalSearchDto.lat && !finalSearchDto.lon && this.geocodingService.isAvailable()) {
      try {
        this.logger.log(`Geocodificando lugar: "${finalSearchDto.name}"`);
        const geocodingResult = await this.geocodingService.geocode(finalSearchDto.name);
        finalSearchDto.lat = geocodingResult.lat;
        finalSearchDto.lon = geocodingResult.lon;
        this.logger.log(
          `Geocodificación exitosa: ${finalSearchDto.name} -> (${geocodingResult.lat}, ${geocodingResult.lon})`,
        );
      } catch (error) {
        this.logger.warn(`Error al geocodificar "${finalSearchDto.name}": ${error.message}. Continuando sin geocodificación.`);
        // Continuar sin geocodificación si falla
      }
    }

    // Realizar la búsqueda en Overpass
    const places = await this.overpassService.searchTrekkingPlaces(finalSearchDto);

    this.logger.log(`Se encontraron ${places.length} lugares de trekking`);

    // Generar recomendación de IA si se usó búsqueda inteligente
    let aiRecommendation: string | undefined;
    if (searchDto.query && this.aiService.isAvailable() && places.length > 0) {
      try {
        aiRecommendation = await this.aiService.generateRecommendations(places, searchDto.query);
      } catch (error) {
        this.logger.warn(`Error al generar recomendación de IA: ${error.message}`);
      }
    }

    return {
      places,
      total: places.length,
      limit: finalSearchDto.limit || 20,
      aiRecommendation,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { OverpassService } from './services/overpass.service';
import { SearchTrekkingPlacesDto } from './dto/search-trekking-places.dto';
import { TrekkingPlaceResponseDto, TrekkingPlacesResponseDto } from './dto/trekking-place-response.dto';

@Injectable()
export class TrekkingPlacesService {
  private readonly logger = new Logger(TrekkingPlacesService.name);

  constructor(private readonly overpassService: OverpassService) {}

  async searchPlaces(searchDto: SearchTrekkingPlacesDto): Promise<TrekkingPlacesResponseDto> {
    this.logger.log(`Buscando lugares de trekking con parámetros: ${JSON.stringify(searchDto)}`);

    const places = await this.overpassService.searchTrekkingPlaces(searchDto);

    this.logger.log(`Se encontraron ${places.length} lugares de trekking`);

    return {
      places,
      total: places.length,
      limit: searchDto.limit || 20,
    };
  }
}

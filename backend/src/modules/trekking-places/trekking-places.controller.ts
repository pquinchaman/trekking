import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TrekkingPlacesService } from './trekking-places.service';
import { SearchTrekkingPlacesDto } from './dto/search-trekking-places.dto';
import { TrekkingPlacesResponseDto } from './dto/trekking-place-response.dto';

@ApiTags('trekking')
@Controller('trekking-places')
export class TrekkingPlacesController {
  constructor(private readonly trekkingPlacesService: TrekkingPlacesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar lugares de trekking y senderismo en Chile',
    description:
      'Obtiene una lista de lugares donde se puede realizar trekking o senderismo en Chile. ' +
      'Los datos provienen de OpenStreetMap a través de Overpass API. ' +
      'Soporta búsqueda inteligente con lenguaje natural usando IA y geocodificación automática de nombres de lugares.',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Consulta en lenguaje natural para búsqueda inteligente. Ej: "lugares fáciles cerca de Santiago con sombra"',
    example: 'lugares fáciles cerca de Santiago',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lugares de trekking encontrados',
    type: TrekkingPlacesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de búsqueda inválidos',
  })
  @ApiResponse({
    status: 503,
    description: 'Error al obtener datos de OpenStreetMap',
  })
  async searchPlaces(@Query() searchDto: SearchTrekkingPlacesDto): Promise<TrekkingPlacesResponseDto> {
    return this.trekkingPlacesService.searchPlaces(searchDto);
  }
}

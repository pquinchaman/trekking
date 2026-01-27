import { ApiProperty } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitud', example: -33.4489 })
  lat: number;

  @ApiProperty({ description: 'Longitud', example: -70.6693 })
  lon: number;
}

export class TrekkingPlaceResponseDto {
  @ApiProperty({ description: 'ID del lugar', example: '123456789' })
  id: string;

  @ApiProperty({ description: 'Nombre del lugar o sendero', example: 'Sendero a la Laguna El Morado' })
  name: string;

  @ApiProperty({ description: 'Tipo de lugar', example: 'hiking' })
  type: string;

  @ApiProperty({ description: 'Coordenadas del lugar', type: CoordinatesDto })
  coordinates: CoordinatesDto;

  @ApiProperty({ description: 'Descripción del lugar', required: false })
  description?: string;

  @ApiProperty({ description: 'Dificultad estimada', required: false })
  difficulty?: string;

  @ApiProperty({ description: 'Distancia en kilómetros', required: false })
  distance?: number;

  @ApiProperty({ description: 'Duración estimada en horas', required: false })
  duration?: number;

  @ApiProperty({ description: 'Elevación en metros', required: false })
  elevation?: number;

  @ApiProperty({ description: 'Fuente de los datos', example: 'OpenStreetMap' })
  source: string;

  @ApiProperty({ description: 'URL del lugar en OpenStreetMap', required: false })
  osmUrl?: string;
}

export class TrekkingPlacesResponseDto {
  @ApiProperty({ description: 'Lista de lugares de trekking', type: [TrekkingPlaceResponseDto] })
  places: TrekkingPlaceResponseDto[];

  @ApiProperty({ description: 'Total de resultados encontrados', example: 15 })
  total: number;

  @ApiProperty({ description: 'Límite de resultados aplicado', example: 20 })
  limit: number;
}

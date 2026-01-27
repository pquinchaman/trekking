import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum DifficultyLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard',
  EXPERT = 'expert',
}

export class SearchTrekkingPlacesDto {
  @ApiPropertyOptional({
    description: 'Latitud del punto central de búsqueda',
    example: -33.4489,
    minimum: -56.0,
    maximum: -17.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-56.0)
  @Max(-17.5)
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitud del punto central de búsqueda',
    example: -70.6693,
    minimum: -75.6,
    maximum: -66.4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-75.6)
  @Max(-66.4)
  lon?: number;

  @ApiPropertyOptional({
    description: 'Radio de búsqueda en kilómetros',
    example: 50,
    minimum: 1,
    maximum: 500,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  radius?: number = 50;

  @ApiPropertyOptional({
    description: 'Nivel de dificultad del sendero',
    enum: DifficultyLevel,
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({
    description: 'Nombre del lugar o sendero',
    example: 'Torres del Paine',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Límite de resultados',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

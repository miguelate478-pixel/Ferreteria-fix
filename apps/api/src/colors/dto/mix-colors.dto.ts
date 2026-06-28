import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsHexColor,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ColorPartDto {
  /** Color hexadecimal de la parte base, ej. "#FFFFFF" */
  @ApiProperty({ example: '#FFFFFF', description: 'Color hexadecimal de la parte' })
  @IsHexColor()
  hex!: string;

  /** Proporción relativa (0-100). Los valores se normalizan internamente. */
  @ApiProperty({ example: 70, description: 'Proporción relativa 0-100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  proportion!: number;
}

export class MixColorsDto {
  @ApiProperty({ type: [ColorPartDto], description: 'Lista de colores y proporciones a mezclar' })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ColorPartDto)
  parts!: ColorPartDto[];

  /** Si se provee, busca la coincidencia más cercana en el catálogo */
  @ApiPropertyOptional({ description: 'Marca del catálogo para buscar coincidencias, ej. "Marca Demo"' })
  @IsOptional()
  @IsString()
  brand?: string;
}

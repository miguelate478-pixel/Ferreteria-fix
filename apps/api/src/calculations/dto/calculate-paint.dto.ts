import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OpeningDto {
  @ApiProperty() @IsNumber() @Min(0.01) width!: number;
  @ApiProperty() @IsNumber() @Min(0.01) height!: number;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() @Min(1) quantity?: number;
}

export class CalculatePaintDto {
  @ApiProperty({ example: 5 }) @IsNumber() @Min(0.1) length!: number;
  @ApiProperty({ example: 4 }) @IsNumber() @Min(0.1) width!: number;
  @ApiProperty({ example: 2.5 }) @IsNumber() @Min(0.1) height!: number;
  @ApiPropertyOptional({ type: [OpeningDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OpeningDto) openings?: OpeningDto[];
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) excludedArea?: number;
  @ApiProperty({ example: 2 }) @IsNumber() @Min(1) @Max(8) coats!: number;
  @ApiProperty({ example: 10 }) @IsNumber() @Min(1) nominalCoverage!: number;
  @ApiProperty({ example: 0.85 }) @IsNumber() @Min(0.4) @Max(1.2) surfaceFactor!: number;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() @Min(0.4) @Max(1.2) applicationFactor?: number;
  @ApiProperty({ example: 10 }) @IsNumber() @Min(0) @Max(50) wastePercent!: number;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() includeCeiling?: boolean;
}

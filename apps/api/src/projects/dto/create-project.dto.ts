import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Dormitorio principal' }) @IsString() name!: string;
  @ApiProperty({ example: 'cliente@ejemplo.com' }) @IsEmail() ownerEmail!: string;
  @ApiPropertyOptional({ example: 5 }) @IsOptional() @IsNumber() @Min(0.1) length?: number;
  @ApiPropertyOptional({ example: 4 }) @IsOptional() @IsNumber() @Min(0.1) width?: number;
  @ApiPropertyOptional({ example: 2.5 }) @IsOptional() @IsNumber() @Min(0.1) height?: number;
}

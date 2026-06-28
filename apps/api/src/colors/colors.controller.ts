import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ColorsService } from './colors.service';
import { MixColorsDto } from './dto/mix-colors.dto';

@ApiTags('colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly service: ColorsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista colores del catálogo, filtrables por marca, familia y búsqueda de texto' })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'family', required: false })
  @ApiQuery({ name: 'search', required: false })
  listColors(
    @Query('brand') brand?: string,
    @Query('family') family?: string,
    @Query('search') search?: string,
  ) {
    return this.service.listColors(brand, family, search);
  }

  @Post('mix')
  @ApiOperation({
    summary: 'Mezcla colores por proporciones en espacio OkLab y devuelve el resultado + coincidencias del catálogo',
  })
  mixColors(@Body() dto: MixColorsDto) {
    return this.service.mixColors(dto);
  }

  @Get('harmony')
  @ApiOperation({ summary: 'Genera una paleta armónica (complementaria, análoga, triádica, split) desde un color base' })
  @ApiQuery({ name: 'hex', required: true, description: 'Color base en formato hex, ej. #DDD6C8' })
  @ApiQuery({
    name: 'scheme',
    required: false,
    enum: ['complementary', 'analogous', 'triadic', 'split'],
    description: 'Esquema armónico a generar',
  })
  generateHarmony(
    @Query('hex') hex: string,
    @Query('scheme') scheme: 'complementary' | 'analogous' | 'triadic' | 'split' = 'analogous',
  ) {
    return this.service.generateHarmony(hex, scheme);
  }
}

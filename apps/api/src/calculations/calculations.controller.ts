import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CalculationsService } from './calculations.service';
import { CalculatePaintDto } from './dto/calculate-paint.dto';

@ApiTags('calculations')
@Controller('calculations')
export class CalculationsController {
  constructor(private readonly service: CalculationsService) {}

  @Post('paint')
  calculate(@Body() input: CalculatePaintDto) {
    return this.service.calculatePaint(input);
  }
}

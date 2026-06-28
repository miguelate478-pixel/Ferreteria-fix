import { Controller, Get, Res } from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly service: QuotesService) {}

  @Get('demo/pdf')
  @ApiProduces('application/pdf')
  getDemoPdf(@Res() response: Response): void {
    this.service.streamDemoPdf(response);
  }
}

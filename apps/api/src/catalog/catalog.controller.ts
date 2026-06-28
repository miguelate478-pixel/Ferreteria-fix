import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  @Get('products')
  listProducts() {
    return this.service.listProducts();
  }
}

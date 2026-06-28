import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listProducts() {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        paintSpec: true,
        variants: {
          include: {
            inventoryBalances: {
              include: { location: { include: { branch: true } } },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}

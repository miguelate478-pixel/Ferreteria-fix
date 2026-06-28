import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { CalculationsModule } from './calculations/calculations.module';
import { CatalogModule } from './catalog/catalog.module';
import { ColorsModule } from './colors/colors.module';
import { ProjectsModule } from './projects/projects.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    CalculationsModule,
    CatalogModule,
    ColorsModule,
    ProjectsModule,
    QuotesModule,
  ],
})
export class AppModule {}

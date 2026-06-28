import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('API_PORT', 4000);
  const webOrigin = config.get<string>('WEB_ORIGIN', 'http://localhost:3000');

  app.setGlobalPrefix('api');
  app.enableCors({ origin: webOrigin, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Estudio Digital de Ferretería')
    .setDescription('API del estudio de proyectos, cálculos, catálogo, stock y cotizaciones.')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`API disponible en http://localhost:${port}/api`);
}

void bootstrap();

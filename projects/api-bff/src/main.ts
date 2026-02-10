import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // rotas: /api/auth/register, /api/auth/login, /api/health
  app.enableCors({ origin: true }); // em dev aceita qualquer origem; em prod definir origins
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = app.get(ConfigService);

  const port = Number(config.get('PORT'));

  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}

void bootstrap();

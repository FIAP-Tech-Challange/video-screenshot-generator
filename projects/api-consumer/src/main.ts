import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerDoc } from './docs/swagger.docs';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/validate-env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig>);

  app.enableVersioning({ type: VersioningType.URI });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [config.getOrThrow('KAFKA_BROKER')],
      },
      consumer: {
        groupId: 'video-consumer-group',
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.startAllMicroservices();
  new SwaggerDoc().setupDocs(app);

  await app.listen(config.getOrThrow('PORT'));
}
void bootstrap();

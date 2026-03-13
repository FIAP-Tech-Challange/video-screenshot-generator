import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { EventServicePort } from '../../ports/input/event.service.port';
import { EventService } from '../../services/event.service';

@Controller()
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(
    @Inject(EventService) private readonly eventService: EventServicePort,
  ) {}

  @EventPattern('upload-video')
  async handleVideoUpload(@Payload() payload: any) {
    // NestJS Kafka envia o objeto inteiro (value, key, headers, etc).
    // O evento MinIO está em payload.value
    const event =
      payload?.value !== undefined ? payload.value : payload;
    this.logger.log(
      `Kafka message received. Event keys: ${JSON.stringify(Object.keys(event || {}))}`,
    );
    await this.eventService.handleVideoUpload(event);
  }
}

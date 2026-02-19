import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { EventServicePort } from '../../ports/input/event.service.port';
import { EventService } from '../../services/event.service';

@Controller()
export class EventController {
  constructor(
    @Inject(EventService) private readonly eventService: EventServicePort,
  ) {}

  @EventPattern('upload-video')
  async handleVideoUpload(@Payload() payload: any) {
    await this.eventService.handleVideoUpload(payload);
  }
}

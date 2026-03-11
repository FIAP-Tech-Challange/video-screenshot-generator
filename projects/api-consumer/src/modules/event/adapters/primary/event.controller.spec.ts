import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from '../../services/event.service';
import { UploadObjectEventPayload } from '../../types/upload-object.type';

const mockEventService = {
  handleVideoUpload: jest.fn(),
};

describe('EventController', () => {
  let controller: EventController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockEventService }],
    }).compile();

    controller = module.get(EventController);
  });

  it('delegates the payload to eventService.handleVideoUpload', async () => {
    const payload = {
      EventName: 's3:ObjectCreated:Put',
      Key: 'job-123.mp4',
      Records: [],
    } as unknown as UploadObjectEventPayload;

    await controller.handleVideoUpload(payload);

    expect(mockEventService.handleVideoUpload).toHaveBeenCalledWith(payload);
  });
});

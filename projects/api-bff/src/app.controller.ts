import { Controller, Get } from '@nestjs/common';
import { Public } from './modules/auth/public.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}

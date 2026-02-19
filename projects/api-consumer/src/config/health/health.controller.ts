import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller({
  path: 'health',
})
export class HealthController {
  @Get()
  check() {
    return { message: 'App is up' };
  }
}

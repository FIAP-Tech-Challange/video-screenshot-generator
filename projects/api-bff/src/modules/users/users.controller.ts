import { Controller, Get } from '@nestjs/common';
import { UserId } from '../auth/user-id.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getLoggedUser(@UserId() userId: string) {
    return this.usersService.getUserById(userId);
  }
}

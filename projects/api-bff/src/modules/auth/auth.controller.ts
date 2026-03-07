import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { Public } from './public.decorator';

interface AuthRequestDto {
  email: string;
  password: string;
}

interface CreateAuthResponseDto {
  name: string;
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: CreateAuthResponseDto): Promise<Partial<User>> {
    const { user } = await this.authService.register(
      body.email,
      body.password,
      body.name,
    );

    return user;
  }

  @Public()
  @Post('login')
  async login(@Body() body: AuthRequestDto): Promise<{
    accessToken: string;
    user: { id: string; email: string; name: string };
  }> {
    const email = body?.email ?? '';
    const password = body?.password ?? '';
    return this.authService.login(email, password);
  }
}

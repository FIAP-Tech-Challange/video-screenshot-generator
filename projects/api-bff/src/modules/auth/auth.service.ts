import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import type { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: Partial<User> }> {
    if (!email?.trim() || !password?.trim() || !name?.trim()) {
      throw new BadRequestException('Email, password, and name are required');
    }

    const user = await this.usersService.createUser(email, password, name);
    return { user };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    if (!email?.trim() || !password?.trim()) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}

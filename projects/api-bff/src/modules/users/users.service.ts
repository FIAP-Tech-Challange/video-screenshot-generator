import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'util';
import { User } from './user.entity';

type SimpleUser = {
  id: string;
  email: string;
  name: string;
};

const scryptAsync = promisify(scrypt);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<SimpleUser> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const salt = randomBytes(16).toString('hex');
    const hashedPassword = await this.hashPassword(password, salt);

    const user = this.usersRepository.create({
      email,
      name,
      hashedPassword,
      salt,
    });

    const saved = await this.usersRepository.save(user);
    return {
      id: saved.id,
      email: saved.email,
      name: saved.name,
    };
  }

  private async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async validateCredentials(
    email: string,
    plainPassword: string,
  ): Promise<SimpleUser | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const hashedPassword = await this.hashPassword(plainPassword, user.salt);
    if (hashedPassword !== user.hashedPassword) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const derivedKey = (await scryptAsync(password, salt, 32)) as Buffer;
    return derivedKey.toString('hex');
  }
}

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { scrypt, randomBytes } from 'node:crypto';
import { promisify } from 'util';
import { User } from './user.entity';

const scryptAsync = promisify(scrypt);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user with a per-user salt and hashed password.
   * Throws ConflictException if email is already registered.
   */
  async createUser(
    email: string,
    plainPassword: string,
  ): Promise<Partial<User>> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Generate per-user salt and hash the password with it
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = await this.hashPassword(plainPassword, salt);

    const user = this.usersRepository.create({
      email,
      hashedPassword,
      salt,
    });

    const saved = await this.usersRepository.save(user);
    return this.removeSensitive(saved) as Partial<User>;
  }

  /**
   * Find a user by email. Returns the full entity (including hashedPassword/salt).
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by id. Returns the full entity (including hashedPassword/salt).
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Validate credentials. Returns user without sensitive fields on success,
   * or null on failure.
   */
  async validateCredentials(
    email: string,
    plainPassword: string,
  ): Promise<Partial<User> | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const hashedPassword = await this.hashPassword(plainPassword, user.salt);
    if (hashedPassword !== user.hashedPassword) return null;

    return this.removeSensitive(user);
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const derivedKey = (await scryptAsync(password, salt, 32)) as Buffer;
    return derivedKey.toString('hex');
  }

  /**
   * Remove sensitive fields (hashedPassword, salt) before returning user data.
   */
  removeSensitive(user: User | null): Partial<User> | null {
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, salt, ...safe } = user as any;
    return safe as Partial<User>;
  }
}

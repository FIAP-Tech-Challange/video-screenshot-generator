import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { UsersService } from './users.service';
import { User } from './user.entity';

// Mock crypto.randomBytes
jest.mock('node:crypto', () => {
  const actual =
    jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    ...actual,
    randomBytes: jest.fn(),
  };
});

import { randomBytes } from 'node:crypto';

const scryptAsync = promisify(scrypt);

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    it('should successfully create a new user', async () => {
      // Arrange
      const salt = 'a1b2c3d4e5f67890a1b2c3d4e5f67890';
      const hashedPassword = 'mockedhashedpassword';

      (randomBytes as jest.Mock).mockReturnValue(Buffer.from(salt, 'hex'));

      // Mock findByEmail to return null (user doesn't exist)
      repository.findOne.mockResolvedValue(null);

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name,
        hashedPassword,
        salt,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.createUser(email, password, name);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith({
        email,
        name,
        hashedPassword: expect.any(String) as string,
        salt: expect.any(String) as string,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result).not.toHaveProperty('hashedPassword');
      expect(result).not.toHaveProperty('salt');
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      const existingUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name,
        hashedPassword: 'existinghash',
        salt: 'existingsalt',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.createUser(email, password, name)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createUser(email, password, name)).rejects.toThrow(
        'Email already in use',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should generate unique salt for each user', async () => {
      // Arrange
      const salt1 = 'a1b2c3d4e5f67890a1b2c3d4e5f67890';
      const salt2 = 'f1e2d3c4b5a69780f1e2d3c4b5a69780';

      (randomBytes as jest.Mock)
        .mockReturnValueOnce(Buffer.from(salt1, 'hex'))
        .mockReturnValueOnce(Buffer.from(salt2, 'hex'));

      repository.findOne.mockResolvedValue(null);

      const mockUser1 = {
        id: 'id1',
        email: 'user1@example.com',
        name: 'User 1',
        hashedPassword: 'hash1',
        salt: salt1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const mockUser2 = {
        id: 'id2',
        email: 'user2@example.com',
        name: 'User 2',
        hashedPassword: 'hash2',
        salt: salt2,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repository.create
        .mockReturnValueOnce(mockUser1)
        .mockReturnValueOnce(mockUser2);
      repository.save
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);

      // Act
      await service.createUser('user1@example.com', password, 'User 1');
      await service.createUser('user2@example.com', password, 'User 2');

      // Assert
      expect(randomBytes).toHaveBeenCalledTimes(2);
      expect(randomBytes).toHaveBeenCalledWith(16);
    });

    it('should hash password before saving', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name,
        hashedPassword: 'somehashedpassword',
        salt: 'somesalt',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      // Act
      await service.createUser(email, password, name);

      // Assert
      const createCall = repository.create.mock.calls[0]?.[0];
      expect(createCall?.hashedPassword).toBeDefined();
      expect(createCall?.hashedPassword).not.toBe(password);
      expect(createCall?.hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe('validateCredentials', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const salt = 'a1b2c3d4e5f6';
    let hashedPassword: string;

    beforeEach(async () => {
      // Create a real hash for testing
      const derivedKey = (await scryptAsync(password, salt, 32)) as Buffer;
      hashedPassword = derivedKey.toString('hex');
    });

    it('should return user data when credentials are valid', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name: 'Test User',
        hashedPassword,
        salt,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateCredentials(email, password);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result).not.toHaveProperty('hashedPassword');
      expect(result).not.toHaveProperty('salt');
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateCredentials(email, password);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name: 'Test User',
        hashedPassword,
        salt,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateCredentials(email, 'wrongpassword');

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });

    it('should correctly validate different users with different salts', async () => {
      // Arrange
      const user1Email = 'user1@example.com';
      const user1Password = 'password1';
      const user1Salt = 'salt1';

      const user1Hash = (
        (await scryptAsync(user1Password, user1Salt, 32)) as Buffer
      ).toString('hex');

      const mockUser1 = {
        id: 'id1',
        email: user1Email,
        name: 'User 1',
        hashedPassword: user1Hash,
        salt: user1Salt,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repository.findOne.mockResolvedValue(mockUser1);

      // Act
      const result = await service.validateCredentials(
        user1Email,
        user1Password,
      );

      // Assert
      expect(result).toEqual({
        id: mockUser1.id,
        email: mockUser1.email,
        name: mockUser1.name,
      });
    });

    it('should handle empty password', async () => {
      // Arrange
      const emptyPasswordHash = (
        (await scryptAsync('', salt, 32)) as Buffer
      ).toString('hex');

      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name: 'Test User',
        hashedPassword: emptyPasswordHash,
        salt,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      repository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateCredentials(email, '');

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle database errors during user creation', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({} as User);
      repository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.createUser(email, password, name)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle database errors during credential validation', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      repository.findOne.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(
        service.validateCredentials(email, password),
      ).rejects.toThrow('Database connection failed');
    });
  });
});

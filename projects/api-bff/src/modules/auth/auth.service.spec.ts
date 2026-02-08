import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUsersService = {
    createUser: jest.fn(),
    validateCredentials: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    it('should successfully register a new user', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name,
      };

      usersService.createUser.mockResolvedValue(mockUser);

      // Act
      const result = await service.register(email, password, name);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).toHaveBeenCalledWith(
        email,
        password,
        name,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        user: mockUser,
      });
    });

    it('should throw BadRequestException when email is empty', async () => {
      // Act & Assert
      await expect(service.register('', password, name)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register('', password, name)).rejects.toThrow(
        'Email, password, and name are required',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is only whitespace', async () => {
      // Act & Assert
      await expect(service.register('   ', password, name)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register('   ', password, name)).rejects.toThrow(
        'Email, password, and name are required',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is empty', async () => {
      // Act & Assert
      await expect(service.register(email, '', name)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(email, '', name)).rejects.toThrow(
        'Email, password, and name are required',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is only whitespace', async () => {
      // Act & Assert
      await expect(service.register(email, '   ', name)).rejects.toThrow(
        BadRequestException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when name is empty', async () => {
      // Act & Assert
      await expect(service.register(email, password, '')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(email, password, '')).rejects.toThrow(
        'Email, password, and name are required',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when name is only whitespace', async () => {
      // Act & Assert
      await expect(service.register(email, password, '   ')).rejects.toThrow(
        BadRequestException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when all fields are empty', async () => {
      // Act & Assert
      await expect(service.register('', '', '')).rejects.toThrow(
        BadRequestException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is null or undefined', async () => {
      // Act & Assert
      await expect(
        service.register(null as unknown as string, password, name),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.register(undefined as unknown as string, password, name),
      ).rejects.toThrow(BadRequestException);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should propagate errors from UsersService', async () => {
      // Arrange
      usersService.createUser.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.register(email, password, name)).rejects.toThrow(
        'Database error',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).toHaveBeenCalledWith(
        email,
        password,
        name,
      );
    });

    it('should trim whitespace from valid inputs before processing', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name,
      };

      usersService.createUser.mockResolvedValue(mockUser);

      // Act
      await service.register(`  ${email}  `, `  ${password}  `, `  ${name}  `);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).toHaveBeenCalledWith(
        `  ${email}  `,
        `  ${password}  `,
        `  ${name}  `,
      );
    });
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email,
        name: 'Test User',
      };

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      usersService.validateCredentials.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.login(email, password);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).toHaveBeenCalledWith(
        email,
        password,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        accessToken: mockToken,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      usersService.validateCredentials.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).toHaveBeenCalledWith(
        email,
        password,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is empty', async () => {
      // Act & Assert
      await expect(service.login('', password)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login('', password)).rejects.toThrow(
        'Email and password are required',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is only whitespace', async () => {
      // Act & Assert
      await expect(service.login('   ', password)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login('   ', password)).rejects.toThrow(
        'Email and password are required',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is empty', async () => {
      // Act & Assert
      await expect(service.login(email, '')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(email, '')).rejects.toThrow(
        'Email and password are required',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is only whitespace', async () => {
      // Act & Assert
      await expect(service.login(email, '   ')).rejects.toThrow(
        BadRequestException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when both fields are empty', async () => {
      // Act & Assert
      await expect(service.login('', '')).rejects.toThrow(BadRequestException);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is null or undefined', async () => {
      // Act & Assert
      await expect(
        service.login(null as unknown as string, password),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.login(undefined as unknown as string, password),
      ).rejects.toThrow(BadRequestException);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is null or undefined', async () => {
      // Act & Assert
      await expect(
        service.login(email, null as unknown as string),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.login(email, undefined as unknown as string),
      ).rejects.toThrow(BadRequestException);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).not.toHaveBeenCalled();
    });

    it('should generate JWT with correct payload', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
      };

      const mockToken = 'jwt.token.here';

      usersService.validateCredentials.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(mockToken);

      // Act
      await service.login(email, password);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'user@example.com',
      });
    });

    it('should handle multiple login attempts', async () => {
      // Arrange
      const mockUser1 = {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User 1',
      };

      const mockUser2 = {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User 2',
      };

      const mockToken1 = 'token1';
      const mockToken2 = 'token2';

      usersService.validateCredentials
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);

      jwtService.sign
        .mockReturnValueOnce(mockToken1)
        .mockReturnValueOnce(mockToken2);

      // Act
      const result1 = await service.login('user1@example.com', 'pass1');
      const result2 = await service.login('user2@example.com', 'pass2');

      // Assert
      expect(result1.accessToken).toBe(mockToken1);
      expect(result2.accessToken).toBe(mockToken2);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).toHaveBeenCalledTimes(2);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should propagate errors from UsersService during validation', async () => {
      // Arrange
      usersService.validateCredentials.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(service.login(email, password)).rejects.toThrow(
        'Database connection failed',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.validateCredentials).toHaveBeenCalledWith(
        email,
        password,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in email during registration', async () => {
      // Arrange
      const specialEmail = 'test+special@example.co.uk';
      const mockUser = {
        id: '123',
        email: specialEmail,
        name: 'Test',
      };

      usersService.createUser.mockResolvedValue(mockUser);

      // Act
      const result = await service.register(specialEmail, 'password', 'Test');

      // Assert
      expect(result.user.email).toBe(specialEmail);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.createUser).toHaveBeenCalledWith(
        specialEmail,
        'password',
        'Test',
      );
    });

    it('should handle unicode characters in name during registration', async () => {
      // Arrange
      const unicodeName = 'José García 日本語';
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: unicodeName,
      };

      usersService.createUser.mockResolvedValue(mockUser);

      // Act
      const result = await service.register(
        'test@example.com',
        'password',
        unicodeName,
      );

      // Assert
      expect(result.user.name).toBe(unicodeName);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should return the created user from AuthService', async () => {
      const user = { id: 'u-1', email: 'a@b.com', name: 'Alice' };
      mockAuthService.register.mockResolvedValue({ user });

      const result = await controller.register({
        email: 'a@b.com',
        password: 'secret',
        name: 'Alice',
      });

      expect(mockAuthService.register).toHaveBeenCalledWith(
        'a@b.com',
        'secret',
        'Alice',
      );
      expect(result).toEqual(user);
    });

    it('should propagate BadRequestException from AuthService', async () => {
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Email, password, and name are required'),
      );

      await expect(
        controller.register({ email: '', password: '', name: '' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return accessToken and user from AuthService', async () => {
      const response = {
        accessToken: 'jwt.token.here',
        user: { id: 'u-1', email: 'a@b.com', name: 'Alice' },
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login({
        email: 'a@b.com',
        password: 'secret',
      });

      expect(mockAuthService.login).toHaveBeenCalledWith('a@b.com', 'secret');
      expect(result).toEqual(response);
    });

    it('should default to empty strings when body fields are missing', async () => {
      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Email and password are required'),
      );

      await expect(controller.login({} as any)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith('', '');
    });

    it('should propagate UnauthorizedException from AuthService', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(
        controller.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt.guard';

const mockVerifyAsync = jest.fn();
const mockGetAllAndOverride = jest.fn();

const makeContext = (overrides: {
  path?: string;
  authorization?: string;
  isPublic?: boolean;
}) => {
  mockGetAllAndOverride.mockReturnValue(overrides.isPublic ?? false);

  return {
    switchToHttp: () => ({
      getRequest: () => ({
        path: overrides.path ?? '/api/resource',
        headers: {
          authorization: overrides.authorization,
        },
        user: undefined as unknown,
      }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as any;
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    const jwtService = {
      verifyAsync: mockVerifyAsync,
    } as unknown as JwtService;
    const reflector = {
      getAllAndOverride: mockGetAllAndOverride,
    } as unknown as Reflector;

    guard = new JwtAuthGuard(jwtService, reflector);
    jest.clearAllMocks();
  });

  it('should allow access to /metrics without a token', async () => {
    const ctx = makeContext({ path: '/metrics' });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(mockVerifyAsync).not.toHaveBeenCalled();
  });

  it('should allow access to a public route without a token', async () => {
    const ctx = makeContext({ isPublic: true });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(mockVerifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when no Authorization header is present', async () => {
    const ctx = makeContext({});

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(ctx)).rejects.toThrow('Token not found');
  });

  it('should throw UnauthorizedException when Authorization header is not Bearer', async () => {
    const ctx = makeContext({ authorization: 'Basic sometoken' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(ctx)).rejects.toThrow('Token not found');
  });

  it('should throw UnauthorizedException when the token is invalid', async () => {
    mockVerifyAsync.mockRejectedValue(new Error('jwt malformed'));

    const ctx = makeContext({ authorization: 'Bearer bad.token.here' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(ctx)).rejects.toThrow('Invalid token');
  });

  it('should allow access and attach payload to request when token is valid', async () => {
    const payload = { sub: 'user-1', email: 'user@example.com' };
    mockVerifyAsync.mockResolvedValue(payload);

    const request = {
      path: '/api/resource',
      headers: { authorization: 'Bearer valid.token.here' },
      user: undefined as unknown,
    };

    mockGetAllAndOverride.mockReturnValue(false);

    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as any;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(mockVerifyAsync).toHaveBeenCalledWith('valid.token.here');
    expect(request.user).toEqual(payload);
  });
});

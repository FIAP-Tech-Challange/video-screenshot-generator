import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

const mockRedisInstance = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisInstance);
});

describe('CacheService', () => {
  let service: CacheService;

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('redis://localhost:6379'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  describe('get', () => {
    it('should return the parsed value when the key exists', async () => {
      const data = { id: '1', name: 'Alice' };
      mockRedisInstance.get.mockResolvedValue(JSON.stringify(data));

      const result = await service.get<typeof data>('user:1');

      expect(mockRedisInstance.get).toHaveBeenCalledWith('user:1');
      expect(result).toEqual(data);
    });

    it('should return null when the key does not exist', async () => {
      mockRedisInstance.get.mockResolvedValue(null);

      const result = await service.get('missing-key');

      expect(result).toBeNull();
    });

    it('should return null and not throw when redis.get rejects', async () => {
      mockRedisInstance.get.mockRejectedValue(new Error('connection refused'));

      const result = await service.get('some-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should call redis.set with serialized value and TTL', async () => {
      mockRedisInstance.set.mockResolvedValue('OK');
      const data = { id: '1' };

      await service.set('user:1', data, 300);

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        'user:1',
        JSON.stringify(data),
        'EX',
        300,
      );
    });

    it('should not throw when redis.set rejects', async () => {
      mockRedisInstance.set.mockRejectedValue(new Error('write error'));

      await expect(service.set('key', { a: 1 }, 60)).resolves.not.toThrow();
    });
  });

  describe('del', () => {
    it('should call redis.del with the given key', async () => {
      mockRedisInstance.del.mockResolvedValue(1);

      await service.del('user:1');

      expect(mockRedisInstance.del).toHaveBeenCalledWith('user:1');
    });

    it('should not throw when redis.del rejects', async () => {
      mockRedisInstance.del.mockRejectedValue(new Error('delete error'));

      await expect(service.del('key')).resolves.not.toThrow();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call redis.disconnect', () => {
      service.onModuleDestroy();

      expect(mockRedisInstance.disconnect).toHaveBeenCalled();
    });
  });
});

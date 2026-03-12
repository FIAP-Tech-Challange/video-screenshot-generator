import { validateEnv } from './validate-env';

const validConfig = {
  NODE_ENV: 'development',
  PORT: '3000',
  DB_URL: 'postgres://localhost/db',
  DB_LOGGING: 'false',
  JWT_SECRET: 'supersecret',
  MINIO_URL: 'http://minio:9000',
  MINIO_PUBLIC_URL: 'http://localhost:9000',
  MINIO_ACCESS_KEY: 'accesskey',
  MINIO_SECRET_KEY: 'secretkey',
  BUCKET_VIDEO_NAME: 'videos',
  BUCKET_SCREENSHOT_NAME: 'screenshots',
  BUCKET_REGION: 'us-east-1',
  MAX_FILE_SIZE_MB: '100',
  REDIS_URL: 'redis://localhost:6379',
};

describe('validateEnv', () => {
  it('should return a parsed config object when all values are valid', () => {
    const result = validateEnv(validConfig);

    expect(result).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DB_URL: 'postgres://localhost/db',
      DB_LOGGING: false,
      JWT_SECRET: 'supersecret',
      MINIO_URL: 'http://minio:9000',
      MINIO_PUBLIC_URL: 'http://localhost:9000',
      MINIO_ACCESS_KEY: 'accesskey',
      MINIO_SECRET_KEY: 'secretkey',
      BUCKET_VIDEO_NAME: 'videos',
      BUCKET_SCREENSHOT_NAME: 'screenshots',
      BUCKET_REGION: 'us-east-1',
      MAX_FILE_SIZE_MB: 100,
      REDIS_URL: 'redis://localhost:6379',
    });
  });

  describe('NODE_ENV', () => {
    it.each(['development', 'production', 'test'])(
      'should accept "%s" as a valid NODE_ENV',
      (nodeEnv) => {
        expect(() => validateEnv({ ...validConfig, NODE_ENV: nodeEnv })).not.toThrow();
      },
    );

    it('should throw when NODE_ENV is an invalid value', () => {
      expect(() => validateEnv({ ...validConfig, NODE_ENV: 'staging' })).toThrow(
        'NODE_ENV must be development, production, or test',
      );
    });

    it('should throw when NODE_ENV is missing', () => {
      const { NODE_ENV: _, ...rest } = validConfig;
      expect(() => validateEnv(rest)).toThrow('NODE_ENV is required');
    });
  });

  describe('number fields', () => {
    it('should throw when PORT is missing', () => {
      const { PORT: _, ...rest } = validConfig;
      expect(() => validateEnv(rest)).toThrow('PORT must be a valid positive number');
    });

    it('should throw when PORT is not a number', () => {
      expect(() => validateEnv({ ...validConfig, PORT: 'abc' })).toThrow(
        'PORT must be a valid positive number',
      );
    });

    it('should throw when PORT is zero', () => {
      expect(() => validateEnv({ ...validConfig, PORT: '0' })).toThrow(
        'PORT must be a valid positive number',
      );
    });

    it('should throw when MAX_FILE_SIZE_MB is missing', () => {
      const { MAX_FILE_SIZE_MB: _, ...rest } = validConfig;
      expect(() => validateEnv(rest)).toThrow(
        'MAX_FILE_SIZE_MB must be a valid positive number',
      );
    });
  });

  describe('string fields', () => {
    it.each([
      'DB_URL',
      'JWT_SECRET',
      'MINIO_URL',
      'MINIO_PUBLIC_URL',
      'MINIO_ACCESS_KEY',
      'MINIO_SECRET_KEY',
      'BUCKET_VIDEO_NAME',
      'BUCKET_SCREENSHOT_NAME',
      'BUCKET_REGION',
      'REDIS_URL',
    ])('should throw when %s is missing', (key) => {
      const rest = { ...validConfig, [key]: undefined };
      expect(() => validateEnv(rest)).toThrow(`${key} is required`);
    });

    it('should throw when a string field is only whitespace', () => {
      expect(() => validateEnv({ ...validConfig, JWT_SECRET: '   ' })).toThrow(
        'JWT_SECRET is required',
      );
    });
  });

  describe('boolean fields', () => {
    it.each([
      [true, true],
      ['true', true],
      ['1', true],
      [false, false],
      ['false', false],
      ['0', false],
      [undefined, false],
    ])('should parse DB_LOGGING %p as %p', (value, expected) => {
      const result = validateEnv({ ...validConfig, DB_LOGGING: value });
      expect(result.DB_LOGGING).toBe(expected);
    });
  });
});

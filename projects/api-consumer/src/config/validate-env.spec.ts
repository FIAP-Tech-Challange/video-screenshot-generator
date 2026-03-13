import { validateEnv, AppConfig } from './validate-env';

const validEnv: Record<string, unknown> = {
  NODE_ENV: 'development',
  PORT: '3000',
  DB_URL: 'postgres://localhost:5432/db',
  DB_LOGGING: 'false',
  BUCKET_VIDEO_NAME: 'videos',
  BUCKET_SCREENSHOT_NAME: 'screenshots',
  BUCKET_REGION: 'us-east-1',
  MINIO_URL: 'http://localhost:9000',
  MINIO_ACCESS_KEY: 'access-key',
  MINIO_SECRET_KEY: 'secret-key',
  KAFKA_BROKERS: 'localhost:9092',
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '587',
  SMTP_USER: 'user',
  SMTP_PASS: 'pass',
};

describe('validateEnv', () => {
  it('returns a valid AppConfig when all env vars are correct', () => {
    const result = validateEnv(validEnv);

    expect(result).toEqual<AppConfig>({
      NODE_ENV: 'development',
      PORT: 3000,
      DB_URL: 'postgres://localhost:5432/db',
      DB_LOGGING: false,
      BUCKET_VIDEO_NAME: 'videos',
      BUCKET_SCREENSHOT_NAME: 'screenshots',
      BUCKET_REGION: 'us-east-1',
      MINIO_URL: 'http://localhost:9000',
      MINIO_ACCESS_KEY: 'access-key',
      MINIO_SECRET_KEY: 'secret-key',
      KAFKA_BROKERS: 'localhost:9092',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: 587,
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
    });
  });

  describe('NODE_ENV', () => {
    it.each(['production', 'test'] as const)('accepts "%s"', (nodeEnv) => {
      expect(() =>
        validateEnv({ ...validEnv, NODE_ENV: nodeEnv }),
      ).not.toThrow();
    });

    it('throws when NODE_ENV is an invalid value', () => {
      expect(() => validateEnv({ ...validEnv, NODE_ENV: 'staging' })).toThrow(
        'NODE_ENV must be development, production, or test',
      );
    });

    it('throws when NODE_ENV is missing', () => {
      expect(() => validateEnv({ ...validEnv, NODE_ENV: '' })).toThrow(
        'NODE_ENV is required',
      );
    });
  });

  describe('PORT', () => {
    it('throws when PORT is not a number', () => {
      expect(() => validateEnv({ ...validEnv, PORT: 'abc' })).toThrow(
        'PORT must be a valid positive number',
      );
    });

    it('throws when PORT is zero', () => {
      expect(() => validateEnv({ ...validEnv, PORT: '0' })).toThrow(
        'PORT must be a valid positive number',
      );
    });

    it('throws when PORT is negative', () => {
      expect(() => validateEnv({ ...validEnv, PORT: '-1' })).toThrow(
        'PORT must be a valid positive number',
      );
    });
  });

  describe('DB_LOGGING', () => {
    it.each([
      [true, true],
      ['true', true],
      ['1', true],
      [false, false],
      ['false', false],
      ['0', false],
    ])('parses DB_LOGGING %p as %p', (input, expected) => {
      const result = validateEnv({ ...validEnv, DB_LOGGING: input });
      expect(result.DB_LOGGING).toBe(expected);
    });
  });

  describe('required string fields', () => {
    it.each([
      'DB_URL',
      'BUCKET_VIDEO_NAME',
      'BUCKET_SCREENSHOT_NAME',
      'BUCKET_REGION',
      'MINIO_URL',
      'MINIO_ACCESS_KEY',
      'MINIO_SECRET_KEY',
      'KAFKA_BROKERS',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
    ])('throws when %s is missing', (key) => {
      expect(() => validateEnv({ ...validEnv, [key]: '' })).toThrow(
        `${key} is required`,
      );
    });
  });
});

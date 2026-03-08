export type AppConfig = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_URL: string;
  DB_LOGGING: boolean;
  JWT_SECRET: string;
  MINIO_URL: string;
  MINIO_PUBLIC_URL: string;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  BUCKET_VIDEO_NAME: string;
  BUCKET_SCREENSHOT_NAME: string;
  BUCKET_REGION: string;
  MAX_FILE_SIZE_MB: number;
  REDIS_URL: string;
};

function getString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function getNumber(config: Record<string, unknown>, key: string): number {
  const value = Number(config[key]);
  if (Number.isNaN(value) || value <= 0) {
    throw new Error(`${key} must be a valid positive number`);
  }
  return value;
}

function getBoolean(config: Record<string, unknown>, key: string): boolean {
  const value = config[key];
  return value === true || value === 'true' || value === '1';
}

export function validateEnv(config: Record<string, unknown>): AppConfig {
  const nodeEnv = getString(config, 'NODE_ENV');
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be development, production, or test`);
  }

  return {
    NODE_ENV: nodeEnv as AppConfig['NODE_ENV'],
    PORT: getNumber(config, 'PORT'),
    DB_URL: getString(config, 'DB_URL'),
    DB_LOGGING: getBoolean(config, 'DB_LOGGING'),
    JWT_SECRET: getString(config, 'JWT_SECRET'),
    MINIO_URL: getString(config, 'MINIO_URL'),
    MINIO_PUBLIC_URL: getString(config, 'MINIO_PUBLIC_URL'),
    MINIO_ACCESS_KEY: getString(config, 'MINIO_ACCESS_KEY'),
    MINIO_SECRET_KEY: getString(config, 'MINIO_SECRET_KEY'),
    BUCKET_VIDEO_NAME: getString(config, 'BUCKET_VIDEO_NAME'),
    BUCKET_SCREENSHOT_NAME: getString(config, 'BUCKET_SCREENSHOT_NAME'),
    BUCKET_REGION: getString(config, 'BUCKET_REGION'),
    MAX_FILE_SIZE_MB: getNumber(config, 'MAX_FILE_SIZE_MB'),
    REDIS_URL: getString(config, 'REDIS_URL'),
  };
}

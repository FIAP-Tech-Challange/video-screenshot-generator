export type AppConfig = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_URL: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_LOGGING: boolean;
  JWT_SECRET: string;
  MINIO_ENDPOINT: string;
  MINIO_PORT: number;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  BUCKET_VIDEO_NAME: string;
  MAX_FILE_SIZE_MB: number;
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

/**
 * Basic env validation without external dependencies.
 * Accepts the raw env object (process.env) and returns a validated, typed config.
 * Throws an Error if required values are missing or invalid.
 */
export function validateEnv(config: Record<string, unknown>): AppConfig {
  const nodeEnv = getString(config, 'NODE_ENV');
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be development, production, or test`);
  }

  return {
    NODE_ENV: nodeEnv as AppConfig['NODE_ENV'],
    PORT: getNumber(config, 'PORT'),
    DB_URL: getString(config, 'DB_URL'),
    DB_PORT: getNumber(config, 'DB_PORT'),
    DB_USERNAME: getString(config, 'DB_USERNAME'),
    DB_PASSWORD: getString(config, 'DB_PASSWORD'),
    DB_NAME: getString(config, 'DB_NAME'),
    DB_LOGGING: getBoolean(config, 'DB_LOGGING'),
    JWT_SECRET: getString(config, 'JWT_SECRET'),
    MINIO_ENDPOINT: getString(config, 'MINIO_ENDPOINT'),
    MINIO_PORT: getNumber(config, 'MINIO_PORT'),
    MINIO_ACCESS_KEY: getString(config, 'MINIO_ACCESS_KEY'),
    MINIO_SECRET_KEY: getString(config, 'MINIO_SECRET_KEY'),
    BUCKET_VIDEO_NAME: getString(config, 'BUCKET_VIDEO_NAME'),
    MAX_FILE_SIZE_MB: getNumber(config, 'MAX_FILE_SIZE_MB'),
  };
}

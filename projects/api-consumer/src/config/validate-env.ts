export type AppConfig = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_LOGGING: boolean;
  BUCKET_VIDEO_NAME: string;
  BUCKET_SCREENSHOT_NAME: string;
  BUCKET_REGION: string;
  URL_MINIO: string;
  ACCESS_KEY_ID_MINIO: string;
  SECRET_ACCESS_KEY_MINIO: string;
};

/**
 * Basic env validation without external dependencies.
 * Accepts the raw env object (process.env) and returns a validated, typed config.
 * Throws an Error if required values are missing or invalid.
 */
export function validateEnv(config: Record<string, unknown>): AppConfig {
  const nodeEnvRaw = config.NODE_ENV;
  const nodeEnv = typeof nodeEnvRaw === 'string' ? nodeEnvRaw : 'development';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV value: ${String(nodeEnvRaw)}`);
  }

  const portRaw = config.PORT;
  const port = Number(portRaw ?? 3000);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${String(portRaw)}`);
  }

  const dbPortRaw = config.DB_PORT;
  const dbPort = Number(dbPortRaw ?? 5432);
  if (Number.isNaN(dbPort) || dbPort <= 0) {
    throw new Error(`Invalid DB_PORT value: ${String(dbPortRaw)}`);
  }

  const bucketVideoName =
    typeof config.BUCKET_VIDEO_NAME === 'string'
      ? config.BUCKET_VIDEO_NAME
      : '';
  if (!bucketVideoName) {
    throw new Error('BUCKET_VIDEO_NAME is required');
  }

  const bucketScreenshotName =
    typeof config.BUCKET_SCREENSHOT_NAME === 'string'
      ? config.BUCKET_SCREENSHOT_NAME
      : '';
  if (!bucketScreenshotName) {
    throw new Error('BUCKET_SCREENSHOT_NAME is required');
  }

  const bucketRegion =
    typeof config.BUCKET_REGION === 'string' ? config.BUCKET_REGION : '';
  if (!bucketRegion) {
    throw new Error('BUCKET_REGION is required');
  }

  const urlMinio = typeof config.URL_MINIO === 'string' ? config.URL_MINIO : '';
  if (!urlMinio) {
    throw new Error('URL_MINIO is required');
  }

  const accessKeyIdMinio =
    typeof config.ACCESS_KEY_ID_MINIO === 'string'
      ? config.ACCESS_KEY_ID_MINIO
      : '';
  if (!accessKeyIdMinio) {
    throw new Error('ACCESS_KEY_ID_MINIO is required');
  }

  const secretAccessKeyMinio =
    typeof config.SECRET_ACCESS_KEY_MINIO === 'string'
      ? config.SECRET_ACCESS_KEY_MINIO
      : '';
  if (!secretAccessKeyMinio) {
    throw new Error('SECRET_ACCESS_KEY_MINIO is required');
  }

  // DB_LOGGING may be provided as 'true'|'false' strings from env; normalize to boolean
  const rawDbLogging = config.DB_LOGGING;
  const dbLogging =
    rawDbLogging === true || rawDbLogging === 'true' || rawDbLogging === '1';

  return {
    NODE_ENV: nodeEnv as AppConfig['NODE_ENV'],
    PORT: port,
    DB_HOST: typeof config.DB_HOST === 'string' ? config.DB_HOST : '',
    DB_PORT: dbPort,
    DB_USERNAME:
      typeof config.DB_USERNAME === 'string' ? config.DB_USERNAME : '',
    DB_PASSWORD:
      typeof config.DB_PASSWORD === 'string' ? config.DB_PASSWORD : '',
    DB_NAME: typeof config.DB_NAME === 'string' ? config.DB_NAME : 'postgres',
    DB_LOGGING: Boolean(dbLogging),
    BUCKET_VIDEO_NAME: bucketVideoName,
    BUCKET_SCREENSHOT_NAME: bucketScreenshotName,
    BUCKET_REGION: bucketRegion,
    URL_MINIO: urlMinio,
    ACCESS_KEY_ID_MINIO: accessKeyIdMinio,
    SECRET_ACCESS_KEY_MINIO: secretAccessKeyMinio,
  };
}

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

  // DB_LOGGING may be provided as 'true'|'false' strings from env; normalize to boolean
  const rawDbLogging = config.DB_LOGGING;
  const dbLogging =
    rawDbLogging === true || rawDbLogging === 'true' || rawDbLogging === '1';

  const jwtSecret =
    typeof config.JWT_SECRET === 'string' ? config.JWT_SECRET : '';
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return {
    NODE_ENV: nodeEnv as AppConfig['NODE_ENV'],
    PORT: port,
    DB_URL: typeof config.DB_URL === 'string' ? config.DB_URL : '',
    DB_PORT: dbPort,
    DB_USERNAME:
      typeof config.DB_USERNAME === 'string' ? config.DB_USERNAME : '',
    DB_PASSWORD:
      typeof config.DB_PASSWORD === 'string' ? config.DB_PASSWORD : '',
    DB_NAME: typeof config.DB_NAME === 'string' ? config.DB_NAME : 'postgres',
    DB_LOGGING: Boolean(dbLogging),
    JWT_SECRET: jwtSecret,
  };
}

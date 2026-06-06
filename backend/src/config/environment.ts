type Environment = Record<string, string | undefined>;

const REQUIRED_VARIABLES = [
  'DATABASE_URL',
  'DIRECT_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'S3_ENDPOINT',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET_NAME',
  'MAIL_HOST',
  'MAIL_PORT',
  'CLAMAV_HOST',
  'CLAMAV_PORT',
] as const;

function assertInteger(environment: Environment, key: string, minimum = 1): void {
  const value = Number(environment[key]);
  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(`${key} must be an integer greater than or equal to ${minimum}`);
  }
}

export function validateEnvironment(environment: Environment): Environment {
  const missing = REQUIRED_VARIABLES.filter((key) => !environment[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  assertInteger(environment, 'REDIS_PORT');
  assertInteger(environment, 'MAIL_PORT');
  assertInteger(environment, 'CLAMAV_PORT');

  if (environment.PORT) {
    assertInteger(environment, 'PORT');
  }

  if (environment.CLAMAV_TIMEOUT_MS) {
    assertInteger(environment, 'CLAMAV_TIMEOUT_MS');
  }

  return environment;
}

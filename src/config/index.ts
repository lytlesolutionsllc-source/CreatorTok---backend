import dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  get port() { return parseInt(optional('PORT', '5000'), 10); },
  get databaseUrl() { return required('DATABASE_URL'); },
  get jwtSecret() { return required('JWT_SECRET'); },
  get redisUrl() { return optional('REDIS_URL', ''); },
  get tiktokClientKey() { return optional('TIKTOK_CLIENT_KEY', ''); },
  get tiktokClientSecret() { return optional('TIKTOK_CLIENT_SECRET', ''); },
  get nodeEnv() { return optional('NODE_ENV', 'development'); },
};

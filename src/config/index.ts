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
  port: parseInt(optional('PORT', '5000'), 10),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  redisUrl: optional('REDIS_URL', ''),
  tiktokClientKey: optional('TIKTOK_CLIENT_KEY', ''),
  tiktokClientSecret: optional('TIKTOK_CLIENT_SECRET', ''),
  nodeEnv: optional('NODE_ENV', 'development'),
} as const;

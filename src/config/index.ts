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

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  port: parseInt(optional('PORT', '5000'), 10),
  databaseUrl: optional('DATABASE_URL', 'postgresql://user:password@localhost:5432/creatortok'),
  jwtSecret: isProduction ? required('JWT_SECRET') : optional('JWT_SECRET', 'change-me-in-development'),
  redisUrl: optional('REDIS_URL', 'redis://localhost:6379'),
  tiktokClientKey: optional('TIKTOK_CLIENT_KEY', ''),
  tiktokClientSecret: optional('TIKTOK_CLIENT_SECRET', ''),
  nodeEnv: optional('NODE_ENV', 'development'),
} as const;

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  get port() { return parseInt(process.env.PORT || '5000', 10); },
  get databaseUrl() { return required('DATABASE_URL'); },
  get jwtSecret() { return required('JWT_SECRET'); },
  get tiktokClientKey() { return process.env.TIKTOK_CLIENT_KEY || ''; },
  get tiktokClientSecret() { return process.env.TIKTOK_CLIENT_SECRET || ''; },
} as const;

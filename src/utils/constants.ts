// ─── Token expiry ─────────────────────────────────────────────────────────────
export const JWT_EXPIRES_IN = '7d';

// ─── BullMQ queue names ───────────────────────────────────────────────────────
export const QUEUE_NAMES = {
  POST_SCHEDULER: 'post-scheduler',
  POST_PUBLISHER: 'post-publisher',
} as const;

// ─── Pagination defaults ─────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── TikTok API ───────────────────────────────────────────────────────────────
export const TIKTOK_API_BASE = 'https://open-api.tiktok.com';

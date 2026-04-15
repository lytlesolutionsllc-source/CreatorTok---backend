import axios from 'axios';
import { config } from '../config';
import { TIKTOK_API_BASE } from '../utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TikTokAccountInfo {
  openId: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
}

export interface TikTokTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TikTokUploadResult {
  shareId: string;
  videoId: string;
}

// ─── TikTok API client ────────────────────────────────────────────────────────

const tiktokClient = axios.create({
  baseURL: TIKTOK_API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Retrieve basic account info for a TikTok user.
 * This is a scaffold — replace with the real TikTok API call when integrating.
 */
export async function getAccountInfo(accessToken: string): Promise<TikTokAccountInfo> {
  const response = await tiktokClient.get<{ data: { user: TikTokAccountInfo } }>(
    '/user/info/',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data.data.user;
}

/**
 * Upload a video to TikTok on behalf of the authenticated user.
 * This is a scaffold — replace with the real TikTok upload flow when integrating.
 */
export async function uploadVideo(
  accessToken: string,
  videoUrl: string,
  caption: string,
  hashtags: string[],
): Promise<TikTokUploadResult> {
  const hashtagString = hashtags.map((h) => `#${h}`).join(' ');
  const response = await tiktokClient.post<{ data: TikTokUploadResult }>(
    '/share/video/upload/',
    { videoUrl, caption: `${caption} ${hashtagString}`.trim() },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data.data;
}

/**
 * Refresh a TikTok access token using the stored refresh token.
 */
export async function refreshToken(refreshTokenValue: string): Promise<TikTokTokenResponse> {
  const response = await tiktokClient.post<{ data: TikTokTokenResponse }>(
    '/oauth/refresh_token/',
    {
      client_key: config.tiktokClientKey,
      grant_type: 'refresh_token',
      refresh_token: refreshTokenValue,
    },
  );
  return response.data.data;
}

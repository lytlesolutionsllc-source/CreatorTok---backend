import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma.service';
import { AuthenticatedRequest, successResponse, errorResponse } from '../types';
import { config } from '../config';

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
const TIKTOK_SCOPE = 'user.info.basic,user.info.profile,user.info.stats,video.list';

interface StatePayload {
  userId: string;
  csrfToken: string;
}

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
}

interface TikTokUserInfo {
  data: {
    user: {
      open_id: string;
      union_id: string;
      avatar_url: string;
      display_name: string;
      username?: string;
      follower_count?: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

function buildStateToken(userId: string): string {
  const csrfToken = crypto.randomBytes(16).toString('hex');
  const payload: StatePayload = { userId, csrfToken };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
}

function parseStateToken(state: string): StatePayload {
  return jwt.verify(state, config.jwtSecret) as StatePayload;
}

export async function tiktokLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !redirectUri) {
    res.status(500).json(errorResponse('TikTok OAuth is not configured on the server'));
    return;
  }

  const state = buildStateToken(req.userId);

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: TIKTOK_SCOPE,
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  });

  res.redirect(`${TIKTOK_AUTH_URL}?${params.toString()}`);
}

export async function tiktokCallback(req: Request, res: Response): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const { code, state, error, error_description } = req.query as Record<string, string>;

  if (error) {
    res.redirect(
      `${frontendUrl}/dashboard/accounts?error=${encodeURIComponent(error_description ?? error)}`
    );
    return;
  }

  if (!code || !state) {
    res.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent('Missing OAuth parameters')}`);
    return;
  }

  let userId: string;
  try {
    const payload = parseStateToken(state);
    userId = payload.userId;
  } catch {
    res.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent('Invalid or expired state token')}`);
    return;
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    res.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent('TikTok OAuth is not configured on the server')}`);
    return;
  }

  let tokenData: TikTokTokenResponse;
  try {
    const tokenParams = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const tokenRes = await axios.post<TikTokTokenResponse>(
      TIKTOK_TOKEN_URL,
      tokenParams.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    tokenData = tokenRes.data;
  } catch (err) {
    console.error('TikTok token exchange failed:', err instanceof Error ? err.message : err);
    res.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent('Failed to exchange authorization code for access token')}`);
    return;
  }

  let userInfo: TikTokUserInfo;
  try {
    const userRes = await axios.get<TikTokUserInfo>(
      `${TIKTOK_USER_INFO_URL}?fields=open_id,username,display_name,avatar_url,follower_count`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    userInfo = userRes.data;
  } catch (err) {
    console.error('TikTok user info fetch failed:', err instanceof Error ? err.message : err);
    res.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent('Failed to fetch TikTok user profile')}`);
    return;
  }

  const tiktokUser = userInfo.data?.user;
  if (!tiktokUser) {
    res.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent('Invalid profile response from TikTok')}`);
    return;
  }

  // Prefer username → display_name → open_id as a last-resort technical identifier
  const accountName = tiktokUser.username ?? tiktokUser.display_name ?? tiktokUser.open_id;
  const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  try {
    await prisma.tikTokAccount.upsert({
      where: {
        userId_openId: {
          userId,
          openId: tiktokUser.open_id,
        },
      },
      create: {
        userId,
        openId: tiktokUser.open_id,
        accountName,
        displayName: tiktokUser.display_name ?? accountName,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
        profileUrl: tiktokUser.avatar_url ?? null,
        followerCount: tiktokUser.follower_count ?? 0,
      },
      update: {
        accountName,
        displayName: tiktokUser.display_name ?? accountName,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
        profileUrl: tiktokUser.avatar_url ?? null,
        followerCount: tiktokUser.follower_count ?? 0,
      },
    });

    res.redirect(`${frontendUrl}/dashboard/accounts?success=true`);
  } catch (err) {
    console.error('Failed to save TikTok account:', err instanceof Error ? err.message : err);
    res.redirect(`${frontendUrl}/dashboard/accounts?error=${encodeURIComponent('Failed to save TikTok account')}`);
  }
}

export async function getTikTokAccountStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const accounts = await prisma.tikTokAccount.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        accountName: true,
        displayName: true,
        profileUrl: true,
        followerCount: true,
        tokenExpiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse({ accounts }));
  } catch (err) {
    console.error('Failed to fetch TikTok accounts:', err instanceof Error ? err.message : err);
    res.status(500).json(errorResponse('Failed to fetch TikTok accounts'));
  }
}

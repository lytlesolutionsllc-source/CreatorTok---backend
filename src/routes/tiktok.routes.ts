import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { prisma } from '../services/prisma.service';
import { verifyToken } from '../utils/jwt';
import { config } from '../config';
import { errorResponse } from '../types';

const router = Router();

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
const TIKTOK_SCOPES = 'user.info.basic,video.list,video.upload';
const REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI || 'https://creator-tok-backend.vercel.app/api/tiktok/callback';
const FRONTEND_URL =
  process.env.FRONTEND_URL || 'https://creator-tok-frontend.vercel.app';

/**
 * GET /api/tiktok/login
 * Redirects the authenticated user to TikTok's OAuth authorization page.
 * Accepts the JWT via ?token=<jwt> query parameter (browser navigation) or
 * as a standard Authorization: Bearer <jwt> header (AJAX requests).
 */
router.get('/login', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    // Accept token from query param (browser redirect) or Authorization header (AJAX).
    const { token: queryToken } = req.query as { token?: string };
    const authHeader = req.headers.authorization;
    const headerToken =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const token = queryToken || headerToken;

    if (!token) {
      res.status(401).json(errorResponse('Authentication token is required'));
      return;
    }

    let userId: string;
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
    } catch {
      res.status(401).json(errorResponse('Invalid or expired token'));
      return;
    }

    const clientKey = config.tiktokClientKey;
    if (!clientKey) {
      res.status(500).json(errorResponse('TikTok client key is not configured'));
      return;
    }

    // Encode the userId in the state parameter so we can identify the user on callback.
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64url');

    const params = new URLSearchParams({
      client_key: clientKey,
      response_type: 'code',
      scope: TIKTOK_SCOPES,
      redirect_uri: REDIRECT_URI,
      state,
    });

    res.redirect(`${TIKTOK_AUTH_URL}?${params.toString()}`);
  })().catch(next);
});

/**
 * GET /api/tiktok/callback
 * Handles the OAuth redirect from TikTok.
 * Exchanges the authorization code for an access token, fetches the user's
 * TikTok profile, and saves or updates the TikTokAccount record in the DB.
 * Redirects the browser back to the frontend dashboard on success.
 */
router.get('/callback', (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const { code, state, error: tiktokError, error_description } = req.query as {
      code?: string;
      state?: string;
      error?: string;
      error_description?: string;
    };

    // TikTok sends an error query param when the user denies access.
    if (tiktokError) {
      console.error('TikTok OAuth error:', tiktokError, error_description);
      res.redirect(`${FRONTEND_URL}/dashboard?tiktok_error=${encodeURIComponent(tiktokError)}`);
      return;
    }

    if (!code || !state) {
      res.status(400).json(errorResponse('Missing code or state parameter'));
      return;
    }

    // Decode userId from state.
    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
        userId: string;
      };
      userId = decoded.userId;
      if (!userId) throw new Error('userId missing in state');
    } catch {
      res.status(400).json(errorResponse('Invalid state parameter'));
      return;
    }

    const clientKey = config.tiktokClientKey;
    const clientSecret = config.tiktokClientSecret;

    if (!clientKey || !clientSecret) {
      res.status(500).json(errorResponse('TikTok credentials are not configured'));
      return;
    }

    // Exchange code for access token.
    let accessToken: string;
    let refreshToken: string;
    let expiresIn: number;
    let openId: string;

    try {
      const tokenRes = await axios.post(
        TIKTOK_TOKEN_URL,
        new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const tokenData = tokenRes.data as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        open_id: string;
      };

      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
      expiresIn = tokenData.expires_in;
      openId = tokenData.open_id;
    } catch (err) {
      console.error('TikTok token exchange error:', err);
      res.status(502).json(errorResponse('Failed to exchange authorization code'));
      return;
    }

    // Fetch the user's basic profile info.
    let accountName: string;
    let profileUrl: string | undefined;
    let followerCount: number;

    try {
      const userRes = await axios.get(TIKTOK_USER_INFO_URL, {
        params: { fields: 'display_name,avatar_url,follower_count' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData = (
        userRes.data as { data?: { user?: {
          display_name?: string;
          avatar_url?: string;
          follower_count?: number;
        } } }
      ).data?.user;

      accountName = userData?.display_name || openId;
      profileUrl = userData?.avatar_url;
      followerCount = userData?.follower_count ?? 0;
    } catch (err) {
      console.error('TikTok user info error:', err);
      // Non-fatal: fall back to openId as name.
      accountName = openId;
      profileUrl = undefined;
      followerCount = 0;
    }

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Save or update the TikTokAccount, keyed on the stable TikTok openId.
    try {
      await prisma.tikTokAccount.upsert({
        where: { openId },
        update: { accountName, accessToken, refreshToken, tokenExpiresAt, profileUrl, followerCount },
        create: {
          userId,
          openId,
          accountName,
          accessToken,
          refreshToken,
          tokenExpiresAt,
          profileUrl,
          followerCount,
        },
      });
    } catch (err) {
      console.error('DB error saving TikTok account:', err);
      res.status(500).json(errorResponse('Failed to save TikTok account'));
      return;
    }

    // Redirect the browser back to the frontend dashboard.
    res.redirect(`${FRONTEND_URL}/dashboard?tiktok_connected=true`);
  })().catch(next);
});

export default router;

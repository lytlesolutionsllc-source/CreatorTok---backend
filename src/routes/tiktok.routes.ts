import { Router, Request, Response, NextFunction } from 'express';
import { tiktokLogin, tiktokCallback, getTikTokAccountStatus } from '../controllers/tiktok.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

function wrap(fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    authMiddleware(req as AuthenticatedRequest, res, () => {
      fn(req as AuthenticatedRequest, res).catch(next);
    });
  };
}

// GET /api/tiktok/login — redirects the authenticated user to TikTok's OAuth consent screen
router.get('/login', wrap(tiktokLogin));

// GET /api/tiktok/callback — TikTok redirects here after the user grants/denies access
router.get('/callback', (req: Request, res: Response, next: NextFunction) => {
  tiktokCallback(req, res).catch(next);
});

// GET /api/tiktok/accounts — list TikTok accounts linked to the current user
router.get('/accounts', wrap(getTikTokAccountStatus));

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { getTrendingMusic, getFavoritesMusic } from '../controllers/music.controller';
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

// GET /api/music/trending  — list of trending music tracks
router.get('/trending', wrap(getTrendingMusic));

// GET /api/music/favorites  — list of favorite music tracks
router.get('/favorites', wrap(getFavoritesMusic));

export default router;

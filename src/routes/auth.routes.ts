import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';
import { Request, Response, NextFunction } from 'express';

const router = Router();

function authHandler(
  fn: (req: AuthenticatedRequest, res: Response) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    authMiddleware(req as AuthenticatedRequest, res, () => {
      fn(req as AuthenticatedRequest, res).catch(next);
    });
  };
}

router.post('/register', (req, res, next) => register(req, res).catch(next));
router.post('/login', (req, res, next) => login(req, res).catch(next));
router.get('/me', authHandler(getMe));

export default router;

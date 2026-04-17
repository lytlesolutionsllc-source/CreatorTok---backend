import { Router, Request, Response, NextFunction } from 'express';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller';
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

router.get('/', wrap(getAccounts));
router.get('/:id', wrap(getAccount));
router.post('/', wrap(createAccount));
router.put('/:id', wrap(updateAccount));
router.delete('/:id', wrap(deleteAccount));

export default router;

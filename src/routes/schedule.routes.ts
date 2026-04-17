import { Router, Request, Response, NextFunction } from 'express';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/schedule.controller';
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

router.get('/', wrap(getSchedules));
router.get('/:id', wrap(getSchedule));
router.post('/', wrap(createSchedule));
router.put('/:id', wrap(updateSchedule));
router.delete('/:id', wrap(deleteSchedule));

export default router;

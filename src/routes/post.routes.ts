import { Router, Request, Response, NextFunction } from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/post.controller';
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

router.get('/', wrap(getPosts));
router.get('/:id', wrap(getPost));
router.post('/', wrap(createPost));
router.put('/:id', wrap(updatePost));
router.delete('/:id', wrap(deletePost));

export default router;

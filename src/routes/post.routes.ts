import { Router } from 'express';
import {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// GET /api/posts
router.get('/', getPosts);

// POST /api/posts
router.post(
  '/',
  validate([
    { field: 'tiktokAccountId', type: 'string' },
    { field: 'caption', type: 'string' },
  ]),
  createPost,
);

// GET /api/posts/:id
router.get('/:id', getPost);

// PUT /api/posts/:id
router.put('/:id', updatePost);

// DELETE /api/posts/:id
router.delete('/:id', deletePost);

export default router;

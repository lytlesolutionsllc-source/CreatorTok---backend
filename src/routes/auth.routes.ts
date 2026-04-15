import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validate([
    { field: 'email', type: 'string' },
    { field: 'password', type: 'string' },
    { field: 'name', type: 'string' },
  ]),
  register,
);

// POST /api/auth/login
router.post(
  '/login',
  validate([
    { field: 'email', type: 'string' },
    { field: 'password', type: 'string' },
  ]),
  login,
);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

export default router;

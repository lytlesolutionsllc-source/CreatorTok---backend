import { Router } from 'express';
import {
  getAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// GET /api/accounts
router.get('/', getAccounts);

// POST /api/accounts
router.post(
  '/',
  validate([
    { field: 'accountName', type: 'string' },
    { field: 'accessToken', type: 'string' },
    { field: 'refreshToken', type: 'string' },
    { field: 'tokenExpiresAt', type: 'string' },
  ]),
  createAccount,
);

// GET /api/accounts/:id
router.get('/:id', getAccount);

// PUT /api/accounts/:id
router.put('/:id', updateAccount);

// DELETE /api/accounts/:id
router.delete('/:id', deleteAccount);

export default router;

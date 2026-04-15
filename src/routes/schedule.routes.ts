import { Router } from 'express';
import {
  getSchedules,
  createSchedule,
  getSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/schedule.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// GET /api/schedules
router.get('/', getSchedules);

// POST /api/schedules
router.post(
  '/',
  validate([
    { field: 'postId', type: 'string' },
    { field: 'cronExpression', type: 'string' },
  ]),
  createSchedule,
);

// GET /api/schedules/:id
router.get('/:id', getSchedule);

// PUT /api/schedules/:id
router.put('/:id', updateSchedule);

// DELETE /api/schedules/:id
router.delete('/:id', deleteSchedule);

export default router;

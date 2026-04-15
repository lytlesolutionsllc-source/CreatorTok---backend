import { Response, NextFunction } from 'express';
import { AuthRequest, ok, fail } from '../types';
import prisma from '../services/prisma.service';

// GET /api/schedules
export async function getSchedules(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { post: { select: { caption: true, status: true } } },
    });
    res.json(ok(schedules));
  } catch (err) {
    next(err);
  }
}

// POST /api/schedules
export async function createSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { postId, cronExpression, timezone, isActive } = req.body as {
      postId: string;
      cronExpression: string;
      timezone?: string;
      isActive?: boolean;
    };

    // Verify the post belongs to this user
    const post = await prisma.post.findFirst({ where: { id: postId, userId: req.userId } });
    if (!post) {
      res.status(404).json(fail('Post not found'));
      return;
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId: req.userId!,
        postId,
        cronExpression,
        timezone: timezone ?? 'UTC',
        isActive: isActive ?? true,
      },
    });

    res.status(201).json(ok(schedule));
  } catch (err) {
    next(err);
  }
}

// GET /api/schedules/:id
export async function getSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const schedule = await prisma.schedule.findFirst({
      where: { id: req.params['id'], userId: req.userId },
      include: { post: { select: { caption: true, status: true } } },
    });

    if (!schedule) {
      res.status(404).json(fail('Schedule not found'));
      return;
    }

    res.json(ok(schedule));
  } catch (err) {
    next(err);
  }
}

// PUT /api/schedules/:id
export async function updateSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.schedule.findFirst({
      where: { id: req.params['id'], userId: req.userId },
    });

    if (!existing) {
      res.status(404).json(fail('Schedule not found'));
      return;
    }

    const { cronExpression, timezone, isActive, lastRunAt, nextRunAt } = req.body as Partial<{
      cronExpression: string;
      timezone: string;
      isActive: boolean;
      lastRunAt: string;
      nextRunAt: string;
    }>;

    const schedule = await prisma.schedule.update({
      where: { id: existing.id },
      data: {
        ...(cronExpression !== undefined && { cronExpression }),
        ...(timezone !== undefined && { timezone }),
        ...(isActive !== undefined && { isActive }),
        ...(lastRunAt !== undefined && { lastRunAt: new Date(lastRunAt) }),
        ...(nextRunAt !== undefined && { nextRunAt: new Date(nextRunAt) }),
      },
    });

    res.json(ok(schedule));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/schedules/:id
export async function deleteSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.schedule.findFirst({
      where: { id: req.params['id'], userId: req.userId },
    });

    if (!existing) {
      res.status(404).json(fail('Schedule not found'));
      return;
    }

    await prisma.schedule.delete({ where: { id: existing.id } });

    res.json(ok({ deleted: true }));
  } catch (err) {
    next(err);
  }
}

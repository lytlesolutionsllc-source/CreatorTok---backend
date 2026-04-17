import { Response } from 'express';
import { prisma } from '../services/prisma.service';
import { AuthenticatedRequest, successResponse, errorResponse } from '../types';

export async function getSchedules(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { post: true },
    });
    res.json(successResponse({ schedules }));
  } catch {
    res.status(500).json(errorResponse('Failed to fetch schedules'));
  }
}

export async function getSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const schedule = await prisma.schedule.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { post: true },
    });
    if (!schedule) {
      res.status(404).json(errorResponse('Schedule not found'));
      return;
    }
    res.json(successResponse({ schedule }));
  } catch {
    res.status(500).json(errorResponse('Failed to fetch schedule'));
  }
}

export async function createSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { postId, cronExpression, timezone, nextRunAt } = req.body as {
      postId: string;
      cronExpression: string;
      timezone?: string;
      nextRunAt?: string;
    };

    if (!postId || !cronExpression) {
      res.status(400).json(errorResponse('postId and cronExpression are required'));
      return;
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, userId: req.userId },
    });
    if (!post) {
      res.status(404).json(errorResponse('Post not found'));
      return;
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId: req.userId,
        postId,
        cronExpression,
        timezone: timezone ?? 'UTC',
        nextRunAt: nextRunAt ? new Date(nextRunAt) : undefined,
      },
    });
    res.status(201).json(successResponse({ schedule }));
  } catch {
    res.status(500).json(errorResponse('Failed to create schedule'));
  }
}

export async function updateSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.schedule.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json(errorResponse('Schedule not found'));
      return;
    }

    const { cronExpression, timezone, isActive, nextRunAt } = req.body as Partial<{
      cronExpression: string;
      timezone: string;
      isActive: boolean;
      nextRunAt: string;
    }>;

    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: {
        ...(cronExpression !== undefined && { cronExpression }),
        ...(timezone !== undefined && { timezone }),
        ...(isActive !== undefined && { isActive }),
        ...(nextRunAt !== undefined && { nextRunAt: new Date(nextRunAt) }),
      },
    });
    res.json(successResponse({ schedule }));
  } catch {
    res.status(500).json(errorResponse('Failed to update schedule'));
  }
}

export async function deleteSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.schedule.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json(errorResponse('Schedule not found'));
      return;
    }
    await prisma.schedule.delete({ where: { id: req.params.id } });
    res.json(successResponse({ message: 'Schedule deleted' }));
  } catch {
    res.status(500).json(errorResponse('Failed to delete schedule'));
  }
}

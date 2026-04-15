import { Response, NextFunction } from 'express';
import { PostStatus } from '@prisma/client';
import { AuthRequest, ok, fail } from '../types';
import prisma from '../services/prisma.service';

// GET /api/posts
export async function getPosts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const posts = await prisma.post.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { tiktokAccount: { select: { accountName: true } } },
    });
    res.json(ok(posts));
  } catch (err) {
    next(err);
  }
}

// POST /api/posts
export async function createPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tiktokAccountId, caption, videoUrl, thumbnailUrl, hashtags, status, scheduledAt } =
      req.body as {
        tiktokAccountId: string;
        caption: string;
        videoUrl?: string;
        thumbnailUrl?: string;
        hashtags?: string[];
        status?: string;
        scheduledAt?: string;
      };

    // Verify the TikTok account belongs to this user
    const account = await prisma.tikTokAccount.findFirst({
      where: { id: tiktokAccountId, userId: req.userId },
    });

    if (!account) {
      res.status(404).json(fail('TikTok account not found'));
      return;
    }

    const post = await prisma.post.create({
      data: {
        userId: req.userId!,
        tiktokAccountId,
        caption,
        videoUrl,
        thumbnailUrl,
        hashtags: hashtags ?? [],
        status: (status as PostStatus) ?? PostStatus.DRAFT,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
    });

    res.status(201).json(ok(post));
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/:id
export async function getPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await prisma.post.findFirst({
      where: { id: req.params['id'], userId: req.userId },
      include: { tiktokAccount: { select: { accountName: true } } },
    });

    if (!post) {
      res.status(404).json(fail('Post not found'));
      return;
    }

    res.json(ok(post));
  } catch (err) {
    next(err);
  }
}

// PUT /api/posts/:id
export async function updatePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params['id'], userId: req.userId },
    });

    if (!existing) {
      res.status(404).json(fail('Post not found'));
      return;
    }

    const { caption, videoUrl, thumbnailUrl, hashtags, status, scheduledAt } = req.body as Partial<{
      caption: string;
      videoUrl: string;
      thumbnailUrl: string;
      hashtags: string[];
      status: string;
      scheduledAt: string;
    }>;

    const post = await prisma.post.update({
      where: { id: existing.id },
      data: {
        ...(caption !== undefined && { caption }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(hashtags !== undefined && { hashtags }),
        ...(status !== undefined && { status: status as PostStatus }),
        ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
      },
    });

    res.json(ok(post));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/posts/:id
export async function deletePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params['id'], userId: req.userId },
    });

    if (!existing) {
      res.status(404).json(fail('Post not found'));
      return;
    }

    await prisma.post.delete({ where: { id: existing.id } });

    res.json(ok({ deleted: true }));
  } catch (err) {
    next(err);
  }
}

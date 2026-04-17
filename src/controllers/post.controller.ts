import { Response } from 'express';
import { prisma } from '../services/prisma.service';
import { AuthenticatedRequest, successResponse, errorResponse } from '../types';

export async function getPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const posts = await prisma.post.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { tiktokAccount: true },
    });
    res.json(successResponse({ posts }));
  } catch {
    res.status(500).json(errorResponse('Failed to fetch posts'));
  }
}

export async function getPost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const post = await prisma.post.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { tiktokAccount: true, schedules: true },
    });
    if (!post) {
      res.status(404).json(errorResponse('Post not found'));
      return;
    }
    res.json(successResponse({ post }));
  } catch {
    res.status(500).json(errorResponse('Failed to fetch post'));
  }
}

export async function createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { tiktokAccountId, caption, videoUrl, thumbnailUrl, hashtags, scheduledAt } =
      req.body as {
        tiktokAccountId: string;
        caption: string;
        videoUrl?: string;
        thumbnailUrl?: string;
        hashtags?: string[];
        scheduledAt?: string;
      };

    if (!tiktokAccountId || !caption) {
      res.status(400).json(errorResponse('tiktokAccountId and caption are required'));
      return;
    }

    const account = await prisma.tikTokAccount.findFirst({
      where: { id: tiktokAccountId, userId: req.userId },
    });
    if (!account) {
      res.status(404).json(errorResponse('TikTok account not found'));
      return;
    }

    const post = await prisma.post.create({
      data: {
        userId: req.userId,
        tiktokAccountId,
        caption,
        videoUrl,
        thumbnailUrl,
        hashtags: hashtags ?? [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    });
    res.status(201).json(successResponse({ post }));
  } catch {
    res.status(500).json(errorResponse('Failed to create post'));
  }
}

export async function updatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json(errorResponse('Post not found'));
      return;
    }

    const { caption, videoUrl, thumbnailUrl, hashtags, status, scheduledAt } =
      req.body as Partial<{
        caption: string;
        videoUrl: string;
        thumbnailUrl: string;
        hashtags: string[];
        status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
        scheduledAt: string;
      }>;

    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        ...(caption !== undefined && { caption }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(hashtags !== undefined && { hashtags }),
        ...(status !== undefined && { status }),
        ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
      },
    });
    res.json(successResponse({ post }));
  } catch {
    res.status(500).json(errorResponse('Failed to update post'));
  }
}

export async function deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json(errorResponse('Post not found'));
      return;
    }
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json(successResponse({ message: 'Post deleted' }));
  } catch {
    res.status(500).json(errorResponse('Failed to delete post'));
  }
}

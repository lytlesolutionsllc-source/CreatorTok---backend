import { Response } from 'express';
import { prisma } from '../services/prisma.service';
import { AuthenticatedRequest, successResponse, errorResponse } from '../types';

export async function getAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const accounts = await prisma.tikTokAccount.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse({ accounts }));
  } catch {
    res.status(500).json(errorResponse('Failed to fetch accounts'));
  }
}

export async function getAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const account = await prisma.tikTokAccount.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!account) {
      res.status(404).json(errorResponse('Account not found'));
      return;
    }
    res.json(successResponse({ account }));
  } catch {
    res.status(500).json(errorResponse('Failed to fetch account'));
  }
}

export async function createAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { accountName, accessToken, refreshToken, tokenExpiresAt, profileUrl, followerCount } =
      req.body as {
        accountName: string;
        accessToken: string;
        refreshToken: string;
        tokenExpiresAt: string;
        profileUrl?: string;
        followerCount?: number;
      };

    if (!accountName || !accessToken || !refreshToken || !tokenExpiresAt) {
      res.status(400).json(errorResponse('accountName, accessToken, refreshToken, and tokenExpiresAt are required'));
      return;
    }

    const account = await prisma.tikTokAccount.create({
      data: {
        userId: req.userId,
        accountName,
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(tokenExpiresAt),
        profileUrl,
        followerCount: followerCount ?? 0,
      },
    });
    res.status(201).json(successResponse({ account }));
  } catch {
    res.status(500).json(errorResponse('Failed to create account'));
  }
}

export async function updateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.tikTokAccount.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json(errorResponse('Account not found'));
      return;
    }

    const { accountName, accessToken, refreshToken, tokenExpiresAt, profileUrl, followerCount } =
      req.body as Partial<{
        accountName: string;
        accessToken: string;
        refreshToken: string;
        tokenExpiresAt: string;
        profileUrl: string;
        followerCount: number;
      }>;

    const account = await prisma.tikTokAccount.update({
      where: { id: req.params.id },
      data: {
        ...(accountName !== undefined && { accountName }),
        ...(accessToken !== undefined && { accessToken }),
        ...(refreshToken !== undefined && { refreshToken }),
        ...(tokenExpiresAt !== undefined && { tokenExpiresAt: new Date(tokenExpiresAt) }),
        ...(profileUrl !== undefined && { profileUrl }),
        ...(followerCount !== undefined && { followerCount }),
      },
    });
    res.json(successResponse({ account }));
  } catch {
    res.status(500).json(errorResponse('Failed to update account'));
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const existing = await prisma.tikTokAccount.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      res.status(404).json(errorResponse('Account not found'));
      return;
    }
    await prisma.tikTokAccount.delete({ where: { id: req.params.id } });
    res.json(successResponse({ message: 'Account deleted' }));
  } catch {
    res.status(500).json(errorResponse('Failed to delete account'));
  }
}

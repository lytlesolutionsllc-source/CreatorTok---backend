import { Response, NextFunction } from 'express';
import { AuthRequest, ok, fail } from '../types';
import prisma from '../services/prisma.service';

// GET /api/accounts
export async function getAccounts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const accounts = await prisma.tikTokAccount.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ok(accounts));
  } catch (err) {
    next(err);
  }
}

// POST /api/accounts
export async function createAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

    const account = await prisma.tikTokAccount.create({
      data: {
        userId: req.userId!,
        accountName,
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(tokenExpiresAt),
        profileUrl,
        followerCount: followerCount ?? 0,
      },
    });

    res.status(201).json(ok(account));
  } catch (err) {
    next(err);
  }
}

// GET /api/accounts/:id
export async function getAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const account = await prisma.tikTokAccount.findFirst({
      where: { id: req.params['id'], userId: req.userId },
    });

    if (!account) {
      res.status(404).json(fail('Account not found'));
      return;
    }

    res.json(ok(account));
  } catch (err) {
    next(err);
  }
}

// PUT /api/accounts/:id
export async function updateAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.tikTokAccount.findFirst({
      where: { id: req.params['id'], userId: req.userId },
    });

    if (!existing) {
      res.status(404).json(fail('Account not found'));
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
      where: { id: existing.id },
      data: {
        ...(accountName !== undefined && { accountName }),
        ...(accessToken !== undefined && { accessToken }),
        ...(refreshToken !== undefined && { refreshToken }),
        ...(tokenExpiresAt !== undefined && { tokenExpiresAt: new Date(tokenExpiresAt) }),
        ...(profileUrl !== undefined && { profileUrl }),
        ...(followerCount !== undefined && { followerCount }),
      },
    });

    res.json(ok(account));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/accounts/:id
export async function deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.tikTokAccount.findFirst({
      where: { id: req.params['id'], userId: req.userId },
    });

    if (!existing) {
      res.status(404).json(fail('Account not found'));
      return;
    }

    await prisma.tikTokAccount.delete({ where: { id: existing.id } });

    res.json(ok({ deleted: true }));
  } catch (err) {
    next(err);
  }
}

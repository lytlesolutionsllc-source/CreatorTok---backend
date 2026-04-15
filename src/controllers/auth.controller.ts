import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest, ok, fail } from '../types';
import prisma from '../services/prisma.service';
import { generateToken } from '../utils/jwt';

// POST /api/auth/register
export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name: string };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json(fail('Email already registered'));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = generateToken(user.id);

    res.status(201).json(ok({ user, token }));
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json(fail('Invalid credentials'));
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json(fail('Invalid credentials'));
      return;
    }

    const token = generateToken(user.id);

    res.json(ok({ user: { id: user.id, email: user.email, name: user.name }, token }));
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      res.status(404).json(fail('User not found'));
      return;
    }

    res.json(ok(user));
  } catch (err) {
    next(err);
  }
}

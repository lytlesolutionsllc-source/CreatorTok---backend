import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma.service';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest, successResponse, errorResponse } from '../types';
import { SALT_ROUNDS } from '../utils/constants';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name: string;
    };

    if (!email || !password || !name) {
      res.status(400).json(errorResponse('Email, password, and name are required'));
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json(errorResponse('Email already in use'));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = generateToken(user.id);
    res.status(201).json(successResponse({ user, token }));
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json(errorResponse('Registration failed'));
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json(errorResponse('Email and password are required'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const token = generateToken(user.id);
    res.json(successResponse({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    }));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(errorResponse('Login failed'));
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }

    res.json(successResponse({ user }));
  } catch {
    res.status(500).json(errorResponse('Failed to fetch user'));
  }
}

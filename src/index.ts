import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { successResponse, errorResponse } from './types';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import postRoutes from './routes/post.routes';
import scheduleRoutes from './routes/schedule.routes';

const app = express();

// Security & logging middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: errorResponse('Too many requests from this IP, please try again later'),
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: errorResponse('Too many requests from this IP, please try again later'),
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json(successResponse({ status: 'ok', timestamp: new Date().toISOString() }));
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/accounts', apiLimiter, accountRoutes);
app.use('/api/posts', apiLimiter, postRoutes);
app.use('/api/schedules', apiLimiter, scheduleRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json(errorResponse('Route not found'));
});

// Global error handler
app.use(errorMiddleware);

// Only listen when not running on Vercel
if (!process.env.VERCEL) {
  const port = config.port;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;

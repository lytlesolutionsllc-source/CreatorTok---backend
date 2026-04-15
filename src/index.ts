import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import { config } from './config';
import { ok } from './types';
import { errorMiddleware } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import postRoutes from './routes/post.routes';
import scheduleRoutes from './routes/schedule.routes';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json(ok({ status: 'ok', timestamp: new Date().toISOString() }));
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/schedules', scheduleRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Error middleware ─────────────────────────────────────────────────────────

app.use(errorMiddleware);

// ─── Start server ─────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
}

export default app;

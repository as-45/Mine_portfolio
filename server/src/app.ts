import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { apiLimiter } from './middleware/rateLimiters';
import healthRoutes from './routes/health.routes';
import projectRoutes from './routes/project.routes';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';
import adminRoutes from './routes/admin';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Render, Railway etc. sit behind one proxy: trust it so req.ip is the real visitor IP.
  app.set('trust proxy', 1);

  // 1. Security + logging
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGINS, credentials: true }));
  app.use(requestLogger);

  // 2. Body + cookie parsing
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // 3. Routes
  app.use('/api/health', healthRoutes);
  app.use('/api', apiLimiter);
  app.use('/api/projects', projectRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/admin', adminRoutes);

  // 4. Fallbacks (always last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

import express from 'express';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health.routes';
import projectRoutes from './routes/project.routes';
import authRoutes from './routes/auth.routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api/health', healthRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/auth', authRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
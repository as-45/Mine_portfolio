import express from 'express';
import healthRoutes from './routes/health.routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/api/health', healthRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
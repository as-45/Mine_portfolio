import type { Request, Response } from 'express';
import { getDBStatus } from '../config/db';

export function getHealth(_req: Request, res: Response) {
  const database = getDBStatus();
  const healthy = database === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    database,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

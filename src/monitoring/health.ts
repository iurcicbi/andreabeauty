import { Request, Response } from 'express';
import mongoose from 'mongoose';

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const checks = {
    mongo: mongoose.connection.readyState === 1,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  const status = checks.mongo ? 200 : 503;

  res.status(status).json({
    status: status === 200 ? 'healthy' : 'degraded',
    checks,
  });
}

export async function memoryMonitor(): Promise<void> {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const rssMB = Math.round(used.rss / 1024 / 1024);

  if (heapUsedMB > 500) {
    console.warn(`[MONITOR] High memory usage: ${heapUsedMB}MB heap / ${rssMB}MB RSS`);
  }
}

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export function setRedisClient(client: typeof redisClient): void {
  redisClient = client;
}

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const checks = {
    mongo: false,
    redis: false,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  checks.mongo = mongoose.connection.readyState === 1;

  if (redisClient) {
    try {
      await redisClient.ping();
      checks.redis = true;
    } catch {
      checks.redis = false;
    }
  }

  const status = checks.mongo && checks.redis ? 200 : 503;

  res.status(status).json({
    status: status === 200 ? 'healthy' : 'degraded',
    checks,
  });
}

export async function memoryMonitor(): Promise<void> {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const rssMB = Math.round(used.rss / 1024 / 1024);

  if (heapUsedMB > 500) {
    console.warn(`[MONITOR] High memory usage: ${heapUsedMB}MB heap / ${rssMB}MB RSS`);
  }
}

export async function queueMonitor(req: Request, res: Response): Promise<void> {
  const queues = ['reminders', 'whatsapp', 'emails', 'cleanup'];
  const metrics: Record<string, unknown> = {};

  for (const name of queues) {
    const Queue = (await import('bullmq')).Queue;
    const queue = new Queue(name, { connection: { url: process.env.REDIS_URL || '' } });
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);
      metrics[name] = { waiting, active, completed, failed, delayed };
    } finally {
      await queue.close();
    }
  }

  res.json({ queues: metrics, timestamp: new Date().toISOString() });
}

import mongoose from 'mongoose';
import { createClient } from 'redis';
import { env } from './config/env';
import { logger } from './logging/logger';
import { initRateLimiter } from './middleware/rateLimiter';
import { setRedisClient } from './monitoring/health';
import { startReminderWorker } from './workers/reminderWorker';
import { startWhatsAppWorker } from './workers/whatsappWorker';

let redisClient: ReturnType<typeof createClient> | null = null;
let reminderWorker: ReturnType<typeof startReminderWorker> | null = null;

export async function bootstrap(): Promise<void> {
  logger.info({
    msg: 'Starting server',
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    mongoUri: env.MONGODB_URI.replace(/\/\/.*@/, '//***@'),
  });

  await mongoose.connect(env.MONGODB_URI);
  logger.info({ msg: 'MongoDB connected' });

  try {
    redisClient = createClient({
      url: env.REDIS_URL,
      socket: {
        connectTimeout: 3000,
        reconnectStrategy: false,
      },
    });
    await redisClient.connect();
    setRedisClient(redisClient);
    await initRateLimiter();
    logger.info({ msg: 'Redis connected' });

    reminderWorker = startReminderWorker();
    logger.info({ msg: 'Reminder worker started' });
  } catch (err) {
    if (redisClient) {
      redisClient.on('error', () => {});
      try { await redisClient.quit(); } catch { /* ignore */ }
      redisClient = null;
    }
    logger.warn({ msg: 'Redis unavailable, workers and rate limiting disabled', error: (err as Error).message });
  }

  logger.info({ msg: 'Bootstrap complete' });

  return {
    redisClient,
    reminderWorker,
  } as any;
}

export async function shutdown(): Promise<void> {
  logger.info({ msg: 'Shutting down...' });

  if (redisClient) {
    await redisClient.quit();
  }

  await mongoose.disconnect();
  logger.info({ msg: 'Shutdown complete' });
}

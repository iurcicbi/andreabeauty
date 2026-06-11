import mongoose from 'mongoose';
import { env } from './config/env';
import { logger } from './logging/logger';

let reminderScheduler: { initReminderScheduler: () => Promise<void>; stopScheduler: () => void } | null = null;

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
    const { initReminderScheduler, stopScheduler } = require('../lib/cron/reminders');
    reminderScheduler = { initReminderScheduler, stopScheduler };
    await initReminderScheduler();
    logger.info({ msg: 'Reminder scheduler started' });
  } catch (err) {
    logger.warn({ msg: 'Reminder scheduler failed to start', error: (err as Error).message });
  }

  logger.info({ msg: 'Bootstrap complete' });
}

export async function shutdown(): Promise<void> {
  logger.info({ msg: 'Shutting down...' });

  if (reminderScheduler) {
    reminderScheduler.stopScheduler();
  }

  await mongoose.disconnect();
  logger.info({ msg: 'Shutdown complete' });
}

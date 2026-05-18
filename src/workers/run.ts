import mongoose from 'mongoose';
import { startWhatsAppWorker } from './whatsappWorker';
import { startReminderWorker } from './reminderWorker';
import { logger } from '../logging/logger';

async function main(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI || '';
  const REDIS_URL = process.env.REDIS_URL || '';

  if (!MONGODB_URI || !REDIS_URL) {
    console.error('MONGODB_URI and REDIS_URL are required');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  logger.info({ msg: 'Worker: MongoDB connected' });

  const whatsappWorker = startWhatsAppWorker();
  const reminderWorker = startReminderWorker();

  logger.info({ msg: 'Workers started', whatsapp: true, reminder: true });

  process.on('SIGTERM', async () => {
    logger.info({ msg: 'Worker shutting down' });
    await whatsappWorker.close();
    await reminderWorker.close();
    await mongoose.disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info({ msg: 'Worker shutting down' });
    await whatsappWorker.close();
    await reminderWorker.close();
    await mongoose.disconnect();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});

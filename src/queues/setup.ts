import { Queue } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../logging/logger';

const connection = {
  url: env.REDIS_URL,
};

let _reminderQueue: Queue | null = null;
let _whatsappQueue: Queue | null = null;
let _emailQueue: Queue | null = null;
let _cleanupQueue: Queue | null = null;

export function getReminderQueue(): Queue {
  if (!_reminderQueue) _reminderQueue = new Queue('reminders', { connection });
  return _reminderQueue;
}
export function getWhatsappQueue(): Queue {
  if (!_whatsappQueue) _whatsappQueue = new Queue('whatsapp', { connection });
  return _whatsappQueue;
}
export function getEmailQueue(): Queue {
  if (!_emailQueue) _emailQueue = new Queue('emails', { connection });
  return _emailQueue;
}
export function getCleanupQueue(): Queue {
  if (!_cleanupQueue) _cleanupQueue = new Queue('cleanup', { connection });
  return _cleanupQueue;
}

export async function scheduleReminder(
  appointmentId: string,
  remindAt: Date,
  customerPhone: string,
  customerName: string,
): Promise<void> {
  const delay = Math.max(0, remindAt.getTime() - Date.now());

  const existing = await getReminderQueue().getJobs(['delayed']);
  const isDuplicate = existing.some(j =>
    j.data.appointmentId === appointmentId && j.data.type === 'reminder'
  );
  if (isDuplicate) {
    logger.debug({ msg: 'Skipping duplicate reminder', appointmentId });
    return;
  }

  await getReminderQueue().add(
    'send-reminder',
    { appointmentId, customerPhone, customerName, type: 'reminder' },
    { delay, attempts: 3, backoff: { type: 'exponential', delay: 60000 } },
  );

  logger.info({ msg: 'Reminder scheduled', appointmentId, remindAt });
}

export async function sendWhatsAppMessage(
  to: string,
  text: string,
  options?: { priority?: 'high' | 'low'; idempotencyKey?: string },
): Promise<void> {
  await getWhatsappQueue().add(
    'send-message',
    { to, text, idempotencyKey: options?.idempotencyKey },
    {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      priority: options?.priority === 'high' ? 1 : 2,
      deduplication: options?.idempotencyKey ? { id: options.idempotencyKey, ttl: 86400000 } : undefined,
    },
  );
}

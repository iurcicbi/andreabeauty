import { Worker } from 'bullmq';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { logger } from '../logging/logger';
import { env } from '../config/env';
import { createAuditLog } from '../logging/audit';

const connection = { url: env.REDIS_URL };

let client: Client | null = null;
let isReady = false;

async function initClient(): Promise<void> {
  if (client) return;

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: env.WHATSAPP_SESSION_PATH,
      clientId: 'worker',
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    },
  });

  client.on('ready', () => {
    isReady = true;
    logger.info({ msg: 'WhatsApp worker ready' });
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    logger.warn({ msg: 'WhatsApp disconnected', reason });
    setTimeout(() => {
      client = null;
      initClient().catch(err => logger.error({ msg: 'WhatsApp reconnect failed', error: err.message }));
    }, 10000);
  });

  client.on('auth_failure', (msg) => {
    logger.error({ msg: 'WhatsApp auth failure', error: msg });
  });

  await client.initialize();
}

async function sendMessage(to: string, text: string): Promise<boolean> {
  if (!client || !isReady) {
    throw new Error('WhatsApp client not ready');
  }

  const chatId = `${to.replace(/[^0-9]/g, '')}@c.us`;
  await client.sendMessage(chatId, text);
  return true;
}

export function startWhatsAppWorker(): Worker {
  const worker = new Worker('whatsapp', async (job) => {
    const { to, text, idempotencyKey } = job.data;

    logger.info({ msg: 'WhatsApp worker processing', jobId: job.id, to });

    await initClient();

    if (!isReady) {
      throw new Error('WhatsApp not ready, will retry');
    }

    await sendMessage(to, text);

    await createAuditLog({
      userId: 'system',
      action: 'whatsapp.send',
      target: 'whatsapp_message',
      targetId: job.id || undefined,
      after: { to, idempotencyKey },
      correlationId: job.id || undefined,
    });

    logger.info({ msg: 'WhatsApp message sent', jobId: job.id, to });
  }, {
    connection,
    concurrency: env.WHATSAPP_WORKER_CONCURRENCY,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  });

  worker.on('failed', (job, err) => {
    logger.error({
      msg: 'WhatsApp job failed',
      jobId: job?.id,
      attempts: job?.attemptsMade,
      error: err.message,
    });
  });

  worker.on('completed', (job) => {
    logger.debug({ msg: 'WhatsApp job completed', jobId: job.id });
  });

  return worker;
}

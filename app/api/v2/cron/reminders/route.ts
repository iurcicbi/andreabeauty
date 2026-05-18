import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/src/logging/logger';

const CRON_SECRET = process.env.CRON_SECRET || '';

export const POST = async (req: NextRequest) => {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (auth !== CRON_SECRET) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const checkExpiry = searchParams.get('check') === 'expiry';

    const { runDailyReminders, runExpiryCheck } = require('@/lib/cron/reminders');

    if (checkExpiry) {
      await runExpiryCheck();
      logger.info({ msg: 'Cron: expiry check completed' });
      return NextResponse.json({ success: true, message: 'Expiry check completed' });
    }

    await runDailyReminders();
    logger.info({ msg: 'Cron: daily reminders completed' });
    return NextResponse.json({ success: true, message: 'Daily reminders completed' });
  } catch (err: any) {
    logger.error({ msg: 'Cron failed', error: err.message });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
};

export const GET = async () => {
  const { isWhatsAppReady } = require('@/lib/whatsapp');
  return NextResponse.json({
    status: 'active',
    whatsapp: isWhatsAppReady(),
    endpoints: {
      trigger: 'POST /api/v2/cron/reminders (Bearer CRON_SECRET)',
      expiryCheck: 'POST /api/v2/cron/reminders?check=expiry (Bearer CRON_SECRET)',
    },
  });
};

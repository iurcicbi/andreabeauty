import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/src/logging/logger';
import { createAuditLog } from '@/src/logging/audit';

const CRON_SECRET = process.env.CRON_SECRET || '';

export const POST = async (req: NextRequest) => {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (auth !== CRON_SECRET) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { to, text } = body as { to?: string; text?: string };

    if (!to || !text) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'to and text required' } }, { status: 400 });
    }

    const { sendText, isWhatsAppReady } = require('@/lib/whatsapp');
    if (!isWhatsAppReady()) {
      return NextResponse.json({ error: { code: 'WHATSAPP_NOT_READY' } }, { status: 503 });
    }

    const result = await sendText(to, text);

    await createAuditLog({
      userId: 'system',
      action: 'whatsapp.send',
      target: 'whatsapp_message',
      targetId: result.messageId,
      after: { to },
    });

    logger.info({ msg: 'Cron WhatsApp send', to, success: result.success });
    return NextResponse.json({ success: result.success, messageId: result.messageId });
  } catch (err: any) {
    logger.error({ msg: 'Cron WhatsApp failed', error: err.message });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
};

export const GET = async () => {
  const { isWhatsAppReady } = require('@/lib/whatsapp');
  return NextResponse.json({
    status: 'active',
    whatsapp: isWhatsAppReady(),
    usage: 'POST /api/v2/cron/whatsapp { "to": "+39...", "text": "message" }',
  });
};

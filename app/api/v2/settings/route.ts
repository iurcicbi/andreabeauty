import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { updateSettingsSchema } from '@/src/validators/schemas';
import { settingsController } from '@/src/controllers/SettingsController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(async () => {
  const settings = await settingsController.get();
  return NextResponse.json({ success: true, dati: settings });
});

export const PATCH = compose(
  async (ctx) => {
    const settings = await settingsController.update(ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: settings });
  },
  {
    auth: true,
    bodySchema: updateSettingsSchema,
    permissions: ['settings:update' as Permission],
    audit: { action: 'settings.update', target: 'settings' },
  },
);

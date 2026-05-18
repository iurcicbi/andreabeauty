import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { updateServiceSchema } from '@/src/validators/schemas';
import { serviceController } from '@/src/controllers/ServiceController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(async (ctx) => {
  const service = await serviceController.getById(ctx.params.id);
  return NextResponse.json({ success: true, dati: service });
});

export const PUT = compose(
  async (ctx) => {
    const service = await serviceController.update(ctx.params.id, ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: service });
  },
  {
    auth: true,
    bodySchema: updateServiceSchema,
    permissions: ['services:update' as Permission],
    audit: { action: 'service.update', target: 'service', getTargetId: (ctx) => ctx.params.id },
  },
);

export const DELETE = compose(
  async (ctx) => {
    await serviceController.delete(ctx.params.id, ctx.user!.id);
    return NextResponse.json({ success: true, message: 'Service deleted' });
  },
  {
    auth: true,
    permissions: ['services:delete' as Permission],
    audit: { action: 'service.delete', target: 'service', getTargetId: (ctx) => ctx.params.id },
  },
);

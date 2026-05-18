import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { createServiceSchema } from '@/src/validators/schemas';
import { serviceController } from '@/src/controllers/ServiceController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(async (ctx) => {
  const services = await serviceController.list(ctx.query);
  return NextResponse.json({ success: true, dati: services });
});

export const POST = compose(
  async (ctx) => {
    const service = await serviceController.create(ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: service }, { status: 201 });
  },
  {
    auth: true,
    bodySchema: createServiceSchema,
    permissions: ['services:create' as Permission],
    audit: { action: 'service.create', target: 'service', getTargetId: (ctx) => (ctx.body as any)?.nome },
  },
);

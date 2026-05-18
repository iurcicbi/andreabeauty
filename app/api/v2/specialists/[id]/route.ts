import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { updateSpecialistSchema } from '@/src/validators/schemas';
import { specialistController } from '@/src/controllers/SpecialistController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(async (ctx) => {
  const specialist = await specialistController.getById(ctx.params.id);
  return NextResponse.json({ success: true, dati: specialist });
});

export const PUT = compose(
  async (ctx) => {
    const specialist = await specialistController.update(ctx.params.id, ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: specialist });
  },
  {
    auth: true,
    bodySchema: updateSpecialistSchema,
    permissions: ['specialists:update' as Permission],
    audit: { action: 'specialist.update', target: 'specialist', getTargetId: (ctx) => ctx.params.id },
  },
);

export const DELETE = compose(
  async (ctx) => {
    await specialistController.delete(ctx.params.id, ctx.user!.id);
    return NextResponse.json({ success: true, message: 'Specialist deleted' });
  },
  {
    auth: true,
    permissions: ['specialists:delete' as Permission],
    audit: { action: 'specialist.delete', target: 'specialist', getTargetId: (ctx) => ctx.params.id },
  },
);

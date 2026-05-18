import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { createSpecialistSchema } from '@/src/validators/schemas';
import { specialistController } from '@/src/controllers/SpecialistController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(async (ctx) => {
  const specialists = await specialistController.list(ctx.query);
  return NextResponse.json({ success: true, dati: specialists });
});

export const POST = compose(
  async (ctx) => {
    const specialist = await specialistController.create(ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: specialist }, { status: 201 });
  },
  {
    auth: true,
    bodySchema: createSpecialistSchema,
    permissions: ['specialists:create' as Permission],
    audit: { action: 'specialist.create', target: 'specialist', getTargetId: (ctx) => (ctx.body as any)?.utenteId },
  },
);

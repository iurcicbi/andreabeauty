import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { createAppointmentSchema } from '@/src/validators/schemas';
import { appointmentController } from '@/src/controllers/AppointmentController';
import type { Permission } from '@/src/types/auth';

export const POST = compose(
  async (ctx) => {
    const result = await appointmentController.create({
      ...(ctx.body as any),
      userId: ctx.user?.id,
      userRole: ctx.user?.role,
    });
    return NextResponse.json({ success: true, dati: result }, { status: 201 });
  },
  {
    bodySchema: createAppointmentSchema,
    rateLimit: 'booking',
    permissions: ['appointments:create' as Permission],
    audit: {
      action: 'appointment.create',
      target: 'appointment',
      getTargetId: (ctx) => ctx.body && (ctx.body as any).specialistaId,
    },
  },
);

export const GET = compose(
  async (ctx) => {
    const result = await appointmentController.list({
      ...(ctx.query as any),
      userId: ctx.user!.id,
      userRole: ctx.user!.role,
    });
    return NextResponse.json({ success: true, ...result });
  },
  {
    auth: true,
    permissions: ['appointments:read' as Permission],
  },
);

import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { appointmentController } from '@/src/controllers/AppointmentController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(
  async (ctx) => {
    const appointment = await appointmentController.getById(ctx.params.id);
    return NextResponse.json({ success: true, dati: appointment });
  },
  {
    auth: true,
    permissions: ['appointments:read' as Permission],
  },
);

export const PATCH = compose(
  async (ctx) => {
    const { stato } = ctx.body as { stato?: string };

    if (stato === 'confermato') {
      await appointmentController.confirm(ctx.params.id, ctx.user!.id);
    } else if (stato === 'cancellato') {
      await appointmentController.cancel(ctx.params.id, ctx.user!.id, 'specialist');
    }

    return NextResponse.json({ success: true, message: 'Appointment updated' });
  },
  {
    auth: true,
    permissions: ['appointments:update' as Permission],
    audit: {
      action: 'appointment.update',
      target: 'appointment',
      getTargetId: (ctx) => ctx.params.id,
    },
  },
);

export const DELETE = compose(
  async (ctx) => {
    await appointmentController.cancel(ctx.params.id, ctx.user!.id, 'specialist');
    return NextResponse.json({ success: true, message: 'Appointment cancelled' });
  },
  {
    auth: true,
    permissions: ['appointments:delete' as Permission],
    audit: {
      action: 'appointment.delete',
      target: 'appointment',
      getTargetId: (ctx) => ctx.params.id,
    },
  },
);

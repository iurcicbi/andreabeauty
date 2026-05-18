import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { updateUserSchema } from '@/src/validators/schemas';
import { userController } from '@/src/controllers/UserController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(
  async (ctx) => {
    const user = await userController.getById(ctx.params.id);
    return NextResponse.json({ success: true, dati: user });
  },
  { auth: true, permissions: ['users:read' as Permission] },
);

export const PUT = compose(
  async (ctx) => {
    const user = await userController.update(ctx.params.id, ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: user });
  },
  {
    auth: true,
    bodySchema: updateUserSchema,
    permissions: ['users:update' as Permission],
    audit: { action: 'user.update', target: 'user', getTargetId: (ctx) => ctx.params.id },
  },
);

export const DELETE = compose(
  async (ctx) => {
    await userController.delete(ctx.params.id, ctx.user!.id);
    return NextResponse.json({ success: true, message: 'User deactivated' });
  },
  {
    auth: true,
    permissions: ['users:delete' as Permission],
    audit: { action: 'user.delete', target: 'user', getTargetId: (ctx) => ctx.params.id },
  },
);

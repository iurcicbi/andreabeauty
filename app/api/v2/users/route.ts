import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { createUserSchema } from '@/src/validators/schemas';
import { userController } from '@/src/controllers/UserController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(
  async (ctx) => {
    const result = await userController.list(ctx.query);
    return NextResponse.json({ success: true, ...result });
  },
  {
    auth: true,
    permissions: ['users:read' as Permission],
  },
);

export const POST = compose(
  async (ctx) => {
    const user = await userController.create(ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: user }, { status: 201 });
  },
  {
    auth: true,
    bodySchema: createUserSchema,
    permissions: ['users:create' as Permission],
    audit: { action: 'user.create', target: 'user', getTargetId: (ctx) => (ctx.body as any)?.email },
  },
);

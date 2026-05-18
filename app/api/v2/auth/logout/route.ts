import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { authController } from '@/src/controllers/AuthController';

export const POST = compose(
  async (ctx) => {
    if (ctx.user) {
      await authController.logout(ctx.user.id);
    }
    return NextResponse.json({ success: true, message: 'Logged out' });
  },
  { auth: true, audit: { action: 'user.logout', target: 'user', getTargetId: (ctx) => ctx.user?.id } },
);

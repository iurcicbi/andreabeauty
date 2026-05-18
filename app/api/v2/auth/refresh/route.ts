import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { refreshSchema } from '@/src/validators/schemas';
import { authController } from '@/src/controllers/AuthController';

export const POST = compose(
  async (ctx) => {
    const { refreshToken } = ctx.body as { refreshToken: string };
    const result = await authController.refresh(refreshToken);
    return NextResponse.json({ success: true, ...result });
  },
  { bodySchema: refreshSchema },
);

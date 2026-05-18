import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { registerSchema } from '@/src/validators/schemas';
import { authController } from '@/src/controllers/AuthController';

export const POST = compose(
  async (ctx) => {
    const result = await authController.register(ctx.body as any);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  },
  { bodySchema: registerSchema, rateLimit: 'login' },
);

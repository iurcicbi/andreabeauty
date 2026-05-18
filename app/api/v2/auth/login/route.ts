import { NextRequest, NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { loginSchema } from '@/src/validators/schemas';
import { authController } from '@/src/controllers/AuthController';

export const POST = compose(
  async (ctx) => {
    const { email, password } = ctx.body as { email: string; password: string };
    const result = await authController.login(email, password);
    return NextResponse.json({ success: true, ...result });
  },
  { bodySchema: loginSchema, rateLimit: 'login' },
);

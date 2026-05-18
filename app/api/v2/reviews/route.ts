import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { createReviewSchema } from '@/src/validators/schemas';
import { reviewController } from '@/src/controllers/ReviewController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(
  async (ctx) => {
    const result = await reviewController.list(ctx.query);
    return NextResponse.json({ success: true, ...result });
  },
  { permissions: ['appointments:read' as Permission] },
);

export const POST = compose(
  async (ctx) => {
    const review = await reviewController.create(ctx.body as any, ctx.user?.id || 'anonymous');
    return NextResponse.json({ success: true, dati: review }, { status: 201 });
  },
  { auth: true, bodySchema: createReviewSchema },
);

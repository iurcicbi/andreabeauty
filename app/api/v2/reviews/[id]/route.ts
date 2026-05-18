import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { moderateReviewSchema } from '@/src/validators/schemas';
import { reviewController } from '@/src/controllers/ReviewController';
import type { Permission } from '@/src/types/auth';

export const PATCH = compose(
  async (ctx) => {
    const { status } = ctx.body as { status: 'approved' | 'rejected' };
    const review = await reviewController.moderate(ctx.params.id, status, ctx.user!.id);
    return NextResponse.json({ success: true, dati: review });
  },
  {
    auth: true,
    bodySchema: moderateReviewSchema,
    permissions: ['reviews:moderate' as Permission],
    audit: { action: 'review.moderate', target: 'review', getTargetId: (ctx) => ctx.params.id },
  },
);

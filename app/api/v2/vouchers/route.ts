import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { createVoucherSchema } from '@/src/validators/schemas';
import { voucherController } from '@/src/controllers/VoucherController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(
  async (ctx) => {
    const result = await voucherController.list(ctx.query);
    return NextResponse.json({ success: true, ...result });
  },
  { auth: true, permissions: ['vouchers:read' as Permission] },
);

export const POST = compose(
  async (ctx) => {
    const voucher = await voucherController.create(ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: voucher }, { status: 201 });
  },
  {
    auth: true,
    bodySchema: createVoucherSchema,
    permissions: ['vouchers:create' as Permission],
    audit: { action: 'voucher.create', target: 'voucher', getTargetId: (ctx) => (ctx.body as any)?.code },
  },
);

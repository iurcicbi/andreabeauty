import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { updateVoucherSchema } from '@/src/validators/schemas';
import { voucherController } from '@/src/controllers/VoucherController';
import type { Permission } from '@/src/types/auth';

export const GET = compose(
  async (ctx) => {
    const voucher = await voucherController.getById(ctx.params.id);
    return NextResponse.json({ success: true, dati: voucher });
  },
  { auth: true, permissions: ['vouchers:read' as Permission] },
);

export const PUT = compose(
  async (ctx) => {
    const voucher = await voucherController.update(ctx.params.id, ctx.body as any, ctx.user!.id);
    return NextResponse.json({ success: true, dati: voucher });
  },
  {
    auth: true,
    bodySchema: updateVoucherSchema,
    permissions: ['vouchers:update' as Permission],
    audit: { action: 'voucher.update', target: 'voucher', getTargetId: (ctx) => ctx.params.id },
  },
);

export const DELETE = compose(
  async (ctx) => {
    await voucherController.delete(ctx.params.id, ctx.user!.id);
    return NextResponse.json({ success: true, message: 'Voucher deleted' });
  },
  {
    auth: true,
    permissions: ['vouchers:delete' as Permission],
    audit: { action: 'voucher.delete', target: 'voucher', getTargetId: (ctx) => ctx.params.id },
  },
);

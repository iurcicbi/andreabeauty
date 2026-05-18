import Voucher from '../../utils/mongo/schemi/Voucher';
import { NotFoundError } from '../errors/AppError';
import { createAuditLog } from '../logging/audit';

export class VoucherController {
  async list(filters: { status?: string; page?: number; limit?: number }) {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [vouchers, total] = await Promise.all([
      Voucher.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Voucher.countDocuments(query),
    ]);
    return { vouchers, total, page, limit };
  }

  async getById(id: string) {
    const voucher = await Voucher.findById(id).lean();
    if (!voucher) throw new NotFoundError('Voucher');
    return voucher;
  }

  async create(data: { code: string; type: string; value: number; maxUses?: number; expiresAt?: string; services?: string[]; appliesToAll?: boolean }, userId: string) {
    const voucher = await Voucher.create({
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      maxUses: data.maxUses || 0,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      services: data.services || [],
      appliesToAll: data.appliesToAll || false,
      status: 'active',
    });
    await createAuditLog({ userId, action: 'voucher.create', target: 'voucher', targetId: voucher._id.toString(), after: data as any });
    return voucher;
  }

  async update(id: string, data: Record<string, unknown>, userId: string) {
    const before = await Voucher.findById(id).lean();
    if (!before) throw new NotFoundError('Voucher');
    const updateData = { ...data };
    if (updateData.expiresAt) updateData.expiresAt = new Date(updateData.expiresAt as string);
    const voucher = await Voucher.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
    await createAuditLog({ userId, action: 'voucher.update', target: 'voucher', targetId: id, before: before as any, after: voucher as any });
    return voucher;
  }

  async delete(id: string, userId: string) {
    const before = await Voucher.findById(id).lean();
    if (!before) throw new NotFoundError('Voucher');
    await Voucher.findByIdAndDelete(id);
    await createAuditLog({ userId, action: 'voucher.delete', target: 'voucher', targetId: id, before: before as any });
  }
}

export const voucherController = new VoucherController();

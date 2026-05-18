import { model, Schema, Types } from 'mongoose';
import { logger } from './logger';

interface IAuditLog {
  userId: Types.ObjectId;
  action: string;
  target: string;
  targetId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
  timestamp: Date;
}

const auditSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  action: { type: String, required: true, index: true },
  target: { type: String, required: true, index: true },
  targetId: { type: String },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  correlationId: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

auditSchema.index({ userId: 1, timestamp: -1 });
auditSchema.index({ action: 1, timestamp: -1 });
auditSchema.index({ target: 1, targetId: 1 });

const AuditLog = model<IAuditLog>('audit_logs', auditSchema);

type AuditAction =
  | 'user.login' | 'user.logout' | 'user.create' | 'user.update' | 'user.delete' | 'user.role_change'
  | 'appointment.create' | 'appointment.update' | 'appointment.delete' | 'appointment.confirm' | 'appointment.cancel'
  | 'service.create' | 'service.update' | 'service.delete'
  | 'specialist.create' | 'specialist.update' | 'specialist.delete'
  | 'voucher.create' | 'voucher.update' | 'voucher.delete'
  | 'settings.update'
  | 'whatsapp.send' | 'whatsapp.settings'
  | 'review.moderate'
  | 'admin.access';

export async function createAuditLog(params: {
  userId: string;
  action: AuditAction;
  target: string;
  targetId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
}): Promise<void> {
  try {
    await AuditLog.create({
      userId: new Types.ObjectId(params.userId),
      action: params.action,
      target: params.target,
      targetId: params.targetId,
      before: params.before,
      after: params.after,
      ip: params.ip,
      userAgent: params.userAgent,
      correlationId: params.correlationId,
    });
  } catch (err) {
    logger.error({
      msg: 'Failed to create audit log',
      error: (err as Error).message,
      action: params.action,
    });
  }
}

export async function getAuditLogs(filters: {
  userId?: string;
  action?: string;
  target?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: IAuditLog[]; total: number }> {
  const query: Record<string, unknown> = {};
  if (filters.userId) query.userId = new Types.ObjectId(filters.userId);
  if (filters.action) query.action = filters.action;
  if (filters.target) query.target = filters.target;
  if (filters.from || filters.to) {
    query.timestamp = {};
    if (filters.from) (query.timestamp as Record<string, unknown>).$gte = filters.from;
    if (filters.to) (query.timestamp as Record<string, unknown>).$lte = filters.to;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(filters.offset || 0)
      .limit(filters.limit || 50)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return { logs, total };
}

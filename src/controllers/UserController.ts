import Utente from '../../utils/mongo/schemi/Utente';
import { hashPassword } from '../security/password';
import { NotFoundError } from '../errors/AppError';
import { createAuditLog } from '../logging/audit';

export class UserController {
  async list(filters: { ruolo?: string; page?: number; limit?: number }) {
    const query: Record<string, unknown> = {};
    if (filters.ruolo) query.ruolo = filters.ruolo;
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      Utente.find(query).select('-password').sort({ cognome: 1 }).skip(skip).limit(limit).lean(),
      Utente.countDocuments(query),
    ]);
    return { users, total, page, limit };
  }

  async getById(id: string) {
    const user = await Utente.findById(id).select('-password').lean();
    if (!user) throw new NotFoundError('Utente');
    return user;
  }

  async create(data: { nome: string; cognome: string; email: string; telefono: string; password: string; ruolo?: string }, userId: string) {
    const passwordHash = await hashPassword(data.password);
    const user = await Utente.create({ ...data, password: passwordHash, attivo: true });
    await createAuditLog({ userId, action: 'user.create', target: 'user', targetId: user._id.toString(), after: { ...data, password: undefined } as any });
    const { password: _, ...safe } = user.toObject();
    return safe;
  }

  async update(id: string, data: Record<string, unknown>, userId: string) {
    const before = await Utente.findById(id).select('-password').lean();
    if (!before) throw new NotFoundError('Utente');
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password as string);
    }
    const user = await Utente.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password').lean();
    await createAuditLog({ userId, action: 'user.update', target: 'user', targetId: id, before: before as any, after: user as any });
    return user;
  }

  async delete(id: string, userId: string) {
    const before = await Utente.findById(id).select('-password').lean();
    if (!before) throw new NotFoundError('Utente');
    await Utente.findByIdAndUpdate(id, { attivo: false });
    await createAuditLog({ userId, action: 'user.delete', target: 'user', targetId: id, before: before as any });
  }
}

export const userController = new UserController();

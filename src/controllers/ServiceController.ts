import Servizio from '../../utils/mongo/schemi/Servizio';
import { NotFoundError } from '../errors/AppError';
import { createAuditLog } from '../logging/audit';

export class ServiceController {
  async list(filters: { categoria?: string; attivo?: boolean }) {
    const query: Record<string, unknown> = {};
    if (filters.categoria) query.categoria = filters.categoria;
    if (filters.attivo !== undefined) query.attivo = filters.attivo;
    return Servizio.find(query).sort({ categoria: 1, nome: 1 }).lean();
  }

  async getById(id: string) {
    const service = await Servizio.findById(id).lean();
    if (!service) throw new NotFoundError('Servizio');
    return service;
  }

  async create(data: { nome: string; durata: number; prezzo: number; categoria: string; descrizione?: string }, userId: string) {
    const service = await Servizio.create({ ...data, attivo: true });
    await createAuditLog({ userId, action: 'service.create', target: 'service', targetId: service._id.toString(), after: data as any });
    return service;
  }

  async update(id: string, data: Record<string, unknown>, userId: string) {
    const before = await Servizio.findById(id).lean();
    if (!before) throw new NotFoundError('Servizio');
    const service = await Servizio.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    await createAuditLog({ userId, action: 'service.update', target: 'service', targetId: id, before: before as any, after: service as any });
    return service;
  }

  async delete(id: string, userId: string) {
    const before = await Servizio.findById(id).lean();
    if (!before) throw new NotFoundError('Servizio');
    await Servizio.findByIdAndDelete(id);
    await createAuditLog({ userId, action: 'service.delete', target: 'service', targetId: id, before: before as any });
  }
}

export const serviceController = new ServiceController();

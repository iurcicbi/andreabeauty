import Specialist from '../../utils/mongo/schemi/Specialist';
import { NotFoundError } from '../errors/AppError';
import { createAuditLog } from '../logging/audit';

export class SpecialistController {
  async list(filters: { attivo?: boolean; servizioId?: string }) {
    const query: Record<string, unknown> = {};
    if (filters.attivo !== undefined) query.attivo = filters.attivo;
    if (filters.servizioId) query.specializzazioni = filters.servizioId;
    return Specialist.find(query).populate('utente', 'nome cognome email telefono').populate('specializzazioni', 'nome').sort({ 'utente.nome': 1 }).lean();
  }

  async getById(id: string) {
    const specialist = await Specialist.findById(id).populate('utente', 'nome cognome email telefono').populate('specializzazioni', 'nome').lean();
    if (!specialist) throw new NotFoundError('Specialista');
    return specialist;
  }

  async create(data: { utenteId: string; biografia?: string; specializzazioni?: string[]; telefono?: string; attivo?: boolean }, userId: string) {
    const specialist = await Specialist.create({ utente: data.utenteId, biografia: data.biografia || '', specializzazioni: data.specializzazioni || [], telefono: data.telefono, attivo: data.attivo ?? true });
    await createAuditLog({ userId, action: 'specialist.create', target: 'specialist', targetId: specialist._id.toString(), after: data as any });
    return specialist;
  }

  async update(id: string, data: Record<string, unknown>, userId: string) {
    const before = await Specialist.findById(id).lean();
    if (!before) throw new NotFoundError('Specialista');
    const specialist = await Specialist.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    await createAuditLog({ userId, action: 'specialist.update', target: 'specialist', targetId: id, before: before as any, after: specialist as any });
    return specialist;
  }

  async delete(id: string, userId: string) {
    const before = await Specialist.findById(id).lean();
    if (!before) throw new NotFoundError('Specialista');
    await Specialist.findByIdAndDelete(id);
    await createAuditLog({ userId, action: 'specialist.delete', target: 'specialist', targetId: id, before: before as any });
  }
}

export const specialistController = new SpecialistController();

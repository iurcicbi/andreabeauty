import { Types } from 'mongoose';
import Appuntamento from '../../utils/mongo/schemi/Appuntamento';
import { BookingConflictError } from '../errors/AppError';

interface CreateAppointmentInput {
  utente: { nome: string; cognome: string; telefono: string; email?: string };
  specialista: Types.ObjectId;
  servizio: Types.ObjectId;
  data: Date;
  oraInizio: string;
  oraFine: string;
  note?: string;
  voucherCode?: string;
  sede?: Types.ObjectId;
  postazione?: string;
}

export class AppointmentRepository {
  async findById(id: string): Promise<ReturnType<typeof Appuntamento.hydrate> | null> {
    return Appuntamento.findById(id);
  }

  async findByDateRange(from: Date, to: Date): Promise<ReturnType<typeof Appuntamento.hydrate>[]> {
    return Appuntamento.find({ data: { $gte: from, $lte: to } })
      .sort({ data: 1, oraInizio: 1 });
  }

  async findOverlapping(specialistaId: string, data: Date, oraInizio: string, oraFine: string, excludeId?: string): Promise<ReturnType<typeof Appuntamento.hydrate>[]> {
    const dataInizio = new Date(data); dataInizio.setHours(0, 0, 0, 0);
    const dataFine = new Date(data); dataFine.setHours(23, 59, 59, 999);

    const filtro: Record<string, unknown> = {
      specialista: new Types.ObjectId(specialistaId),
      data: { $gte: dataInizio, $lte: dataFine },
      stato: { $in: ['confermato', 'in_attesa'] },
      $or: [
        { oraInizio: { $lte: oraInizio }, oraFine: { $gt: oraInizio } },
        { oraInizio: { $lt: oraFine }, oraFine: { $gte: oraFine } },
        { oraInizio: { $gte: oraInizio }, oraFine: { $lte: oraFine } },
      ],
    };

    if (excludeId) (filtro as any)._id = { $ne: excludeId };

    return Appuntamento.find(filtro);
  }

  async createAtomic(input: CreateAppointmentInput): Promise<ReturnType<typeof Appuntamento.hydrate>> {
    const [existing] = await this.findOverlapping(
      input.specialista.toString(),
      input.data,
      input.oraInizio,
      input.oraFine,
    );

    if (existing) {
      throw new BookingConflictError();
    }

    return Appuntamento.create(input);
  }

  async updateStatus(id: string, stato: string): Promise<void> {
    await Appuntamento.findByIdAndUpdate(id, { stato });
  }

  async markConfirmed(id: string): Promise<void> {
    await Appuntamento.findByIdAndUpdate(id, {
      stato: 'confermato',
      confirmationResponse: 'si',
      confirmationRespondedAt: new Date(),
    });
  }

  async markCancelled(id: string, cancelledBy: 'customer' | 'specialist'): Promise<void> {
    await Appuntamento.findByIdAndUpdate(id, {
      stato: 'cancellato',
      confirmationResponse: 'no',
      confirmationRespondedAt: new Date(),
      cancelledBy,
      cancelledAt: new Date(),
    });
  }
}

export const appointmentRepository = new AppointmentRepository();

import { Types, ClientSession } from 'mongoose';
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

  async createAtomic(input: CreateAppointmentInput, session?: ClientSession): Promise<ReturnType<typeof Appuntamento.hydrate>> {
    const [existing] = await this.findOverlapping(
      input.specialista.toString(),
      input.data,
      input.oraInizio,
      input.oraFine,
    );

    if (existing) {
      throw new BookingConflictError();
    }

    return Appuntamento.create([input], { session }).then(r => r[0]);
  }

  async updateStatus(id: string, stato: string, session?: ClientSession): Promise<void> {
    await Appuntamento.findByIdAndUpdate(id, { stato }, { session });
  }

  async markConfirmed(id: string, session?: ClientSession): Promise<void> {
    await Appuntamento.findByIdAndUpdate(id, {
      stato: 'confermato',
      confirmationResponse: 'si',
      confirmationRespondedAt: new Date(),
    }, { session });
  }

  async markCancelled(id: string, cancelledBy: 'customer' | 'specialist', session?: ClientSession): Promise<void> {
    await Appuntamento.findByIdAndUpdate(id, {
      stato: 'cancellato',
      confirmationResponse: 'no',
      confirmationRespondedAt: new Date(),
      cancelledBy,
      cancelledAt: new Date(),
    }, { session });
  }
}

export const appointmentRepository = new AppointmentRepository();

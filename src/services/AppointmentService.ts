import mongoose from 'mongoose';
import { appointmentRepository } from '../repositories/AppointmentRepository';
import { createAuditLog } from '../logging/audit';
import { logger } from '../logging/logger';
import { env } from '../config/env';

interface CreateBookingInput {
  utente: { nome: string; cognome: string; telefono: string; email?: string };
  specialistaId: string;
  servizioId: string;
  data: Date;
  oraInizio: string;
  oraFine: string;
  note?: string;
  voucherCode?: string;
  sedeId?: string;
  postazione?: string;
  createdByUserId?: string;
}

export class AppointmentService {
  async createBooking(input: CreateBookingInput): Promise<{ id: string }> {
    try {
      const appointment = await appointmentRepository.createAtomic({
        utente: input.utente,
        specialista: new mongoose.Types.ObjectId(input.specialistaId),
        servizio: new mongoose.Types.ObjectId(input.servizioId),
        data: input.data,
        oraInizio: input.oraInizio,
        oraFine: input.oraFine,
        note: input.note,
        voucherCode: input.voucherCode,
        sede: input.sedeId ? new mongoose.Types.ObjectId(input.sedeId) : undefined,
        postazione: input.postazione,
      });

      const appointmentId = appointment._id.toString();

      await createAuditLog({
        userId: input.createdByUserId || 'system',
        action: 'appointment.create',
        target: 'appointment',
        targetId: appointmentId,
        after: { ...input, utente: undefined } as unknown as Record<string, unknown>,
        correlationId: appointmentId,
      });

      return { id: appointmentId };
    } catch (err) {
      logger.error({ msg: 'Booking creation failed', error: (err as Error).message });
      throw err;
    }
  }

  async confirmBooking(appointmentId: string): Promise<void> {
    try {
      await appointmentRepository.markConfirmed(appointmentId);

      await createAuditLog({
        userId: 'system',
        action: 'appointment.confirm',
        target: 'appointment',
        targetId: appointmentId,
        after: { stato: 'confermato' },
      });
    } catch (err) {
      throw err;
    }
  }

  async cancelBooking(appointmentId: string, cancelledBy: 'customer' | 'specialist'): Promise<void> {
    try {
      await appointmentRepository.markCancelled(appointmentId, cancelledBy);

      await createAuditLog({
        userId: cancelledBy === 'customer' ? 'customer' : 'system',
        action: 'appointment.cancel',
        target: 'appointment',
        targetId: appointmentId,
        after: { stato: 'cancellato', cancelledBy },
      });
    } catch (err) {
      throw err;
    }
  }
}

export const appointmentService = new AppointmentService();

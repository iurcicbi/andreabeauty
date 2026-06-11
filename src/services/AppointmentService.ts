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
  createdByUserId?: string;
}

export class AppointmentService {
  async createBooking(input: CreateBookingInput): Promise<{ id: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const appointment = await appointmentRepository.createAtomic(
        {
          utente: input.utente,
          specialista: new mongoose.Types.ObjectId(input.specialistaId),
          servizio: new mongoose.Types.ObjectId(input.servizioId),
          data: input.data,
          oraInizio: input.oraInizio,
          oraFine: input.oraFine,
          note: input.note,
          voucherCode: input.voucherCode,
        },
        session,
      );

      const appointmentId = appointment._id.toString();

      await createAuditLog({
        userId: input.createdByUserId || 'system',
        action: 'appointment.create',
        target: 'appointment',
        targetId: appointmentId,
        after: { ...input, utente: undefined } as unknown as Record<string, unknown>,
        correlationId: appointmentId,
      });

      await session.commitTransaction();
      return { id: appointmentId };
    } catch (err) {
      await session.abortTransaction();
      logger.error({ msg: 'Booking creation failed', error: (err as Error).message });
      throw err;
    } finally {
      session.endSession();
    }
  }

  async confirmBooking(appointmentId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await appointmentRepository.markConfirmed(appointmentId, session);

      await createAuditLog({
        userId: 'system',
        action: 'appointment.confirm',
        target: 'appointment',
        targetId: appointmentId,
        after: { stato: 'confermato' },
      });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async cancelBooking(appointmentId: string, cancelledBy: 'customer' | 'specialist'): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await appointmentRepository.markCancelled(appointmentId, cancelledBy, session);

      await createAuditLog({
        userId: cancelledBy === 'customer' ? 'customer' : 'system',
        action: 'appointment.cancel',
        target: 'appointment',
        targetId: appointmentId,
        after: { stato: 'cancellato', cancelledBy },
      });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

export const appointmentService = new AppointmentService();

import Appuntamento from '../../utils/mongo/schemi/Appuntamento';
import Utente from '../../utils/mongo/schemi/Utente';
import Servizio from '../../utils/mongo/schemi/Servizio';
import Specialist from '../../utils/mongo/schemi/Specialist';
import { appointmentService } from '../services/AppointmentService';
import { calcolaOraFine } from '../../utils/helpers';
import { NotFoundError, BookingConflictError } from '../errors/AppError';
import { createAuditLog } from '../logging/audit';
import { logger } from '../logging/logger';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

interface CreateBookingParams {
  specialistaId: string;
  servizioId: string;
  data: string;
  oraInizio: string;
  clienteNome?: string;
  clienteCognome?: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  note?: string;
  voucherCode?: string;
  userId?: string;
  userRole?: string;
}

interface ListAppointmentsParams {
  stato?: string;
  data?: string;
  dal?: string;
  al?: string;
  page?: number;
  limit?: number;
  userId: string;
  userRole: string;
}

export class AppointmentController {
  async create(params: CreateBookingParams): Promise<{ id: string }> {
    const servizio = await Servizio.findById(params.servizioId);
    if (!servizio) throw new NotFoundError('Servizio');

    const specialista = await Specialist.findById(params.specialistaId);
    if (!specialista) throw new NotFoundError('Specialista');

    const hasService = specialista.specializzazioni.some(
      (s: any) => s.toString() === params.servizioId,
    );
    if (!hasService) {
      throw new Error('Specialist cannot perform this service');
    }

    const oraFine = calcolaOraFine(params.oraInizio, servizio.durata);

    let datiCliente: { nome: string; cognome: string; telefono: string; email?: string };

    if (params.clienteNome && params.clienteCognome && params.clienteTelefono) {
      let cliente = await Utente.findOne({ telefono: params.clienteTelefono });
      if (cliente) {
        cliente.nome = params.clienteNome;
        cliente.cognome = params.clienteCognome;
        if (params.clienteEmail) cliente.email = params.clienteEmail;
        await cliente.save();
      } else {
        const passwordTemp = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordTemp, salt);
        cliente = await Utente.create({
          nome: params.clienteNome,
          cognome: params.clienteCognome,
          email: params.clienteEmail || `${params.clienteTelefono}@temp.com`,
          password: passwordHash,
          telefono: params.clienteTelefono,
          ruolo: 'utente',
          attivo: true,
        });
      }
      datiCliente = {
        nome: params.clienteNome,
        cognome: params.clienteCognome,
        telefono: params.clienteTelefono,
        email: params.clienteEmail || cliente.email,
      };
    } else if (params.userId) {
      const utente = await Utente.findById(params.userId);
      if (!utente) throw new NotFoundError('Utente');
      datiCliente = {
        nome: utente.nome,
        cognome: utente.cognome,
        telefono: utente.telefono,
        email: utente.email,
      };
    } else {
      throw new Error('Missing customer information');
    }

    const dataAppuntamento = new Date(params.data);
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    if (dataAppuntamento < oggi) {
      throw new Error('Cannot book in the past');
    }

    const stato = (params.userRole === 'specialist' || params.userRole === 'barber')
      ? 'confermato' as const
      : 'in_attesa' as const;

    return appointmentService.createBooking({
      utente: datiCliente,
      specialistaId: params.specialistaId,
      servizioId: params.servizioId,
      data: dataAppuntamento,
      oraInizio: params.oraInizio,
      oraFine,
      note: params.note,
      voucherCode: params.voucherCode,
      createdByUserId: params.userId,
    });
  }

  async list(params: ListAppointmentsParams) {
    const filter: Record<string, unknown> = {};

    if (params.stato) filter.stato = params.stato;
    if (params.data) {
      const d = new Date(params.data);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      filter.data = { $gte: d, $lte: end };
    }
    if (params.dal && params.al) {
      const from = new Date(params.dal);
      from.setHours(0, 0, 0, 0);
      const to = new Date(params.al);
      to.setHours(23, 59, 59, 999);
      filter.data = { $gte: from, $lte: to };
    }

    if (params.userRole !== 'admin') {
      if (params.userRole === 'specialist' || params.userRole === 'barber') {
        const specialist = await Specialist.findOne({ utente: params.userId });
        const specialistId = specialist?._id.toString() || params.userId;
        filter.$or = [
          { specialista: specialistId },
          { specialistOld: params.userId },
        ];
      } else {
        const utente = await Utente.findById(params.userId);
        if (utente) filter['utente.telefono'] = utente.telefono;
      }
    }

    const skip = ((params.page || 1) - 1) * (params.limit || 50);
    const limit = params.limit || 50;

    const [appuntamenti, total] = await Promise.all([
      Appuntamento.find(filter)
        .populate({ path: 'specialista', populate: { path: 'utente', select: 'nome cognome' } })
        .populate('servizio', 'nome durata prezzo categoria')
        .sort({ data: 1, oraInizio: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appuntamento.countDocuments(filter),
    ]);

    return { appuntamenti, total, page: params.page || 1, limit };
  }

  async getById(id: string) {
    const appuntamento = await Appuntamento.findById(id)
      .populate({ path: 'specialista', populate: { path: 'utente', select: 'nome cognome' } })
      .populate('servizio', 'nome durata prezzo categoria');

    if (!appuntamento) throw new NotFoundError('Appuntamento');
    return appuntamento;
  }

  async confirm(id: string, userId: string): Promise<void> {
    await appointmentService.confirmBooking(id);
  }

  async cancel(id: string, userId: string, cancelledBy: 'customer' | 'specialist'): Promise<void> {
    await appointmentService.cancelBooking(id, cancelledBy);
  }
}

export const appointmentController = new AppointmentController();

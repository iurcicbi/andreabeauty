import Review from '../../utils/mongo/schemi/Review';
import Appuntamento from '../../utils/mongo/schemi/Appuntamento';
import { NotFoundError } from '../errors/AppError';
import { createAuditLog } from '../logging/audit';

export class ReviewController {
  async list(filters: { status?: string; page?: number; limit?: number }) {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('appointment', 'data oraInizio')
        .populate({ path: 'specialist', populate: { path: 'utente', select: 'nome cognome' } })
        .populate('service', 'nome')
        .sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
    ]);
    return { reviews, total, page, limit };
  }

  async create(data: { appointmentId: string; rating: number; comment: string }, userId: string) {
    const appointment = await Appuntamento.findById(data.appointmentId);
    if (!appointment) throw new NotFoundError('Appuntamento');

    const review = await Review.create({
      appointment: data.appointmentId,
      specialist: appointment.specialista,
      service: appointment.servizio,
      customerName: `${appointment.utente.nome} ${appointment.utente.cognome}`,
      customerEmail: appointment.utente.email,
      rating: data.rating,
      comment: data.comment,
      status: 'pending',
      token: require('crypto').randomBytes(24).toString('hex'),
    });

    return review;
  }

  async moderate(id: string, status: 'approved' | 'rejected', userId: string) {
    const before = await Review.findById(id).lean();
    if (!before) throw new NotFoundError('Recensione');

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true }).lean();
    await createAuditLog({ userId, action: 'review.moderate', target: 'review', targetId: id, before: before as any, after: review as any });
    return review;
  }
}

export const reviewController = new ReviewController();

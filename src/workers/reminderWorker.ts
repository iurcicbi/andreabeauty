import { Worker } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../logging/logger';
import { appointmentRepository } from '../repositories/AppointmentRepository';
import { sendWhatsAppMessage } from '../queues/setup';
import { createAuditLog } from '../logging/audit';

const connection = { url: env.REDIS_URL };

export function startReminderWorker(): Worker {
  const worker = new Worker('reminders', async (job) => {
    const { appointmentId, customerPhone, customerName, type } = job.data;

    logger.info({ msg: 'Processing reminder', jobId: job.id, appointmentId, type });

    if (type === 'reminder') {
      const appointment = await appointmentRepository.findById(appointmentId);
      if (!appointment) {
        logger.warn({ msg: 'Appointment not found for reminder', appointmentId });
        return;
      }

      if (appointment.confirmationSent || appointment.confirmationResponse) {
        logger.info({ msg: 'Reminder already sent or responded', appointmentId });
        return;
      }

      const dataFormattata = new Date(appointment.data).toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });

      const message =
        `Ciao *${customerName}*! 👋\n\n` +
        `Ti ricordiamo il tuo appuntamento di *oggi*:\n\n` +
        `📅 Data: *${dataFormattata}*\n` +
        `⏰ Orario: *${appointment.oraInizio}*\n\n` +
        `Puoi venire? Rispondi:\n` +
        `✅ *SI* per confermare\n` +
        `❌ *NO* per annullare\n\n` +
        `_Grazie e a presto!_ 🙏`;

      await sendWhatsAppMessage(customerPhone, message, {
        priority: 'high',
        idempotencyKey: `reminder-${appointmentId}`,
      });

      await appointmentRepository.markConfirmed(appointmentId);

      await createAuditLog({
        userId: 'system',
        action: 'appointment.confirm',
        target: 'appointment',
        targetId: appointmentId,
        after: { reminderSent: true },
        correlationId: job.id || undefined,
      });
    }
  }, {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  });

  worker.on('failed', (job, err) => {
    logger.error({
      msg: 'Reminder job failed',
      jobId: job?.id,
      appointmentId: job?.data?.appointmentId,
      attempts: job?.attemptsMade,
      error: err.message,
    });
  });

  return worker;
}

import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid ObjectId');

export const createAppointmentSchema = z.object({
  specialistaId: objectId,
  servizioId: objectId,
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data must be YYYY-MM-DD'),
  oraInizio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time (HH:MM)'),
  clienteNome: z.string().max(100).optional().default(''),
  clienteCognome: z.string().max(100).optional().default(''),
  clienteTelefono: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional().or(z.literal('')),
  clienteEmail: z.string().email().optional().or(z.literal('')),
  note: z.string().max(1000).optional().default(''),
  voucherCode: z.string().max(50).optional(),
  sedeId: objectId.optional(),
  postazione: z.string().max(100).optional(),
});

export const updateAppointmentSchema = z.object({
  servizioId: objectId.optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  oraInizio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  stato: z.enum(['in_attesa', 'confermato', 'completato', 'cancellato', 'scaduto']).optional(),
  note: z.string().max(1000).optional(),
});

export const appointmentQuerySchema = z.object({
  stato: z.string().optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  al: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export const registerSchema = z.object({
  nome: z.string().min(1).max(100),
  cognome: z.string().min(1).max(100),
  email: z.string().email(),
  telefono: z.string().regex(/^\+?[1-9]\d{6,14}$/),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createServiceSchema = z.object({
  nome: z.string().min(1).max(100),
  durata: z.coerce.number().int().positive(),
  prezzo: z.coerce.number().positive(),
  categoria: z.string().min(1).max(50),
  descrizione: z.string().max(2000).optional().default(''),
});

export const createUserSchema = z.object({
  nome: z.string().min(1).max(100),
  cognome: z.string().min(1).max(100),
  email: z.string().email(),
  telefono: z.string().regex(/^\+?[1-9]\d{6,14}$/),
  password: z.string().min(8).max(128),
  ruolo: z.enum(['utente', 'admin', 'operator', 'staff']).optional().default('utente'),
});

export const updateUserSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  cognome: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  telefono: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  ruolo: z.enum(['utente', 'admin', 'operator', 'staff']).optional(),
});

export const updateServiceSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  durata: z.coerce.number().int().positive().optional(),
  prezzo: z.coerce.number().positive().optional(),
  categoria: z.string().min(1).max(50).optional(),
  descrizione: z.string().max(2000).optional(),
});

export const createSpecialistSchema = z.object({
  utenteId: objectId,
  biografia: z.string().max(2000).optional().default(''),
  specializzazioni: z.array(objectId).optional().default([]),
  telefono: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  attivo: z.boolean().optional().default(true),
});

export const updateSpecialistSchema = z.object({
  biografia: z.string().max(2000).optional(),
  specializzazioni: z.array(objectId).optional(),
  telefono: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  attivo: z.boolean().optional(),
  orariSettimanali: z.object({}).optional(),
  giorniChiusura: z.array(z.object({})).optional(),
});

export const createVoucherSchema = z.object({
  code: z.string().min(1).max(50).transform(s => s.toUpperCase()),
  type: z.enum(['percentage', 'fixed', 'free']),
  value: z.coerce.number().positive(),
  maxUses: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  services: z.array(objectId).optional().default([]),
  appliesToAll: z.boolean().optional().default(false),
});

export const updateVoucherSchema = z.object({
  type: z.enum(['percentage', 'fixed', 'free']).optional(),
  value: z.coerce.number().positive().optional(),
  maxUses: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  status: z.enum(['active', 'used', 'expired', 'disabled']).optional(),
});

export const createReviewSchema = z.object({
  appointmentId: objectId,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000),
});

export const moderateReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const updateSettingsSchema = z.object({
  logo: z.string().optional(),
  nomeAzienda: z.string().min(1).max(100).optional(),
  tagline: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  telefono: z.string().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  cap: z.string().optional(),
  provincia: z.string().optional(),
  paese: z.string().optional(),
  linkFacebook: z.string().optional(),
  linkInstagram: z.string().optional(),
  linkWhatsapp: z.string().optional(),
}).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const sendTestWhatsAppSchema = z.object({
  telefono: z.string().regex(/^\+?[1-9]\d{6,14}$/),
  messaggio: z.string().min(1).max(500).optional().default('Test messaggio da Beauty Salon'),
});

export const cronAuthSchema = z.object({
  authorization: z.string().min(1),
});

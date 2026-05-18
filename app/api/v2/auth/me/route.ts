import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import Utente from '@/utils/mongo/schemi/Utente';
import { NotFoundError } from '@/src/errors/AppError';
import { ROLE_PERMISSIONS } from '@/src/types/auth';

export const GET = compose(
  async (ctx) => {
    const user = await Utente.findById(ctx.user!.id).select('-password').lean();
    if (!user) throw new NotFoundError('Utente');

    const permissions = ROLE_PERMISSIONS[ctx.user!.role as keyof typeof ROLE_PERMISSIONS] || [];

    return NextResponse.json({
      success: true,
      dati: { ...user, permissions },
    });
  },
  { auth: true },
);

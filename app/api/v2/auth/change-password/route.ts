import { NextResponse } from 'next/server';
import { compose } from '@/src/middleware/composer';
import { changePasswordSchema } from '@/src/validators/schemas';
import { verifyPassword, hashPassword } from '@/src/security/password';
import Utente from '@/utils/mongo/schemi/Utente';
import { AuthenticationError } from '@/src/errors/AppError';

export const POST = compose(
  async (ctx) => {
    const { currentPassword, newPassword } = ctx.body as { currentPassword: string; newPassword: string };

    const user = await Utente.findById(ctx.user!.id);
    if (!user) throw new AuthenticationError('User not found');

    const valid = await verifyPassword(user.password, currentPassword);
    if (!valid) throw new AuthenticationError('Current password is incorrect');

    user.password = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({ success: true, message: 'Password changed' });
  },
  { auth: true, bodySchema: changePasswordSchema },
);

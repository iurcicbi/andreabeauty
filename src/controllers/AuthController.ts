import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import Utente from '../../utils/mongo/schemi/Utente';
import { hashPassword, verifyPassword } from '../security/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, generateTokenId } from '../security/jwt';
import { AuthenticationError } from '../errors/AppError';
import { createAuditLog } from '../logging/audit';
import { logger } from '../logging/logger';

interface LoginResult {
  user: { id: string; nome: string; cognome: string; email: string; ruolo: string };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthController {
  async register(data: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
    password: string;
  }): Promise<LoginResult> {
    const existing = await Utente.findOne({ email: data.email });
    if (existing) {
      throw new AuthenticationError('Email already registered');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await Utente.create({
      nome: data.nome,
      cognome: data.cognome,
      email: data.email,
      telefono: data.telefono,
      password: passwordHash,
      ruolo: 'utente',
      attivo: true,
    });

    const fingerprint = randomBytes(32).toString('hex');
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: 'utente' as any,
      permissions: [],
      fingerprint,
    });

    const tokenId = generateTokenId();
    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      tokenId,
      fingerprint,
    });

    await createAuditLog({
      userId: user._id.toString(),
      action: 'user.login',
      target: 'user',
      targetId: user._id.toString(),
      after: { method: 'register' },
    });

    return {
      user: {
        id: user._id.toString(),
        nome: user.nome,
        cognome: user.cognome,
        email: user.email,
        ruolo: user.ruolo,
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  async login(email: string, password: string, ip?: string, userAgent?: string): Promise<LoginResult> {
    const user = await Utente.findOne({ email, attivo: true });
    if (!user) {
      logger.warn({ msg: 'Login failed: user not found', email, ip });
      throw new AuthenticationError('Invalid email or password');
    }

    const valid = await verifyPassword(user.password, password);
    if (!valid) {
      logger.warn({ msg: 'Login failed: wrong password', email, ip });
      throw new AuthenticationError('Invalid email or password');
    }

    const fingerprint = randomBytes(32).toString('hex');
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.ruolo as any,
      permissions: [],
      fingerprint,
    });

    const tokenId = generateTokenId();
    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      tokenId,
      fingerprint,
    });

    await createAuditLog({
      userId: user._id.toString(),
      action: 'user.login',
      target: 'user',
      targetId: user._id.toString(),
      ip,
      userAgent,
    });

    return {
      user: {
        id: user._id.toString(),
        nome: user.nome,
        cognome: user.cognome,
        email: user.email,
        ruolo: user.ruolo,
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = verifyRefreshToken(refreshToken);

    const user = await Utente.findById(payload.sub);
    if (!user || !user.attivo) {
      throw new AuthenticationError('User not found or inactive');
    }

    const fingerprint = randomBytes(32).toString('hex');
    const newAccessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.ruolo as any,
      permissions: [],
      fingerprint,
    });

    const newTokenId = generateTokenId();
    const newRefreshToken = signRefreshToken({
      sub: user._id.toString(),
      tokenId: newTokenId,
      fingerprint,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    };
  }

  async logout(userId: string): Promise<void> {
    await createAuditLog({
      userId,
      action: 'user.logout',
      target: 'user',
      targetId: userId,
    });
  }
}

export const authController = new AuthController();

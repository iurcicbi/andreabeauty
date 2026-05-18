import * as argon2 from 'argon2';
import { env } from '../config/env';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: env.ARGON2_TIME_COST,
    memoryCost: env.ARGON2_MEMORY_COST,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

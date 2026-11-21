import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AdminUser } from '../models/AdminUser';
import { AppError } from '../utils/AppError';
import type { LoginBody } from '../validators/auth.validators';

const SALT_ROUNDS = 12;
export const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day

// A real bcrypt hash of a random string. Used so a wrong email takes
// the same time to check as a wrong password (see login below).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

export interface AuthPayload {
  sub: string;
  email: string;
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function login({ email, password }: LoginBody) {
  const admin = await AdminUser.findOne({ email }).select('+passwordHash');

  const passwordOk = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !passwordOk) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const payload: AuthPayload = { sub: admin.id, email: admin.email };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });

  return { token, admin: { id: admin.id as string, email: admin.email } };
}

export function verifyToken(token: string): AuthPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded.sub || !decoded.email) {
      throw new Error('Malformed token');
    }
    return { sub: decoded.sub, email: decoded.email as string };
  } catch {
    throw AppError.unauthorized('Your session is invalid or has expired. Please log in again.');
  }
}

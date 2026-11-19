import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME } from '../config/cookies';
import { verifyToken } from '../services/auth.service';
import { AppError } from '../utils/AppError';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];

  if (typeof token !== 'string' || token.length === 0) {
    throw AppError.unauthorized('You must be logged in');
  }

  req.admin = verifyToken(token);
  next();
}
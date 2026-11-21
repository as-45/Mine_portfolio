import type { Request, Response } from 'express';
import { loginBodySchema } from '../validators/auth.validators';
import * as authService from '../services/auth.service';
import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from '../config/cookies';

export async function login(req: Request, res: Response) {
  const body = loginBodySchema.parse(req.body);
  const { token, admin } = await authService.login(body);

  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.status(200).json({ data: admin });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  res.status(200).json({ data: { loggedOut: true } });
}

export function me(req: Request, res: Response) {
  res.status(200).json({ data: { id: req.admin?.sub, email: req.admin?.email } });
}

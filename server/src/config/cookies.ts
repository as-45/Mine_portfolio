import type { CookieOptions } from 'express';
import { isProduction } from './env';
import { TOKEN_TTL_SECONDS } from '../services/auth.service';

export const AUTH_COOKIE_NAME = 'portfolio_token';

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: TOKEN_TTL_SECONDS * 1000,
};

export const clearAuthCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

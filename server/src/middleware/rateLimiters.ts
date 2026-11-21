import { rateLimit } from 'express-rate-limit';
import { isTest } from '../config/env';

function tooMany(message: string) {
  return { error: 'TooManyRequests', message };
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  message: tooMany('Too many requests. Please slow down and try again shortly.'),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => isTest,
  message: tooMany('Too many login attempts. Please try again in 15 minutes.'),
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  message: tooMany('You have sent too many messages. Please try again in an hour.'),
});

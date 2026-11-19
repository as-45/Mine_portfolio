import type { AuthPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}

export {};
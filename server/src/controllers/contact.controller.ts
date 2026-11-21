import type { Request, Response } from 'express';
import { contactBodySchema } from '../validators/message.validators';
import * as messageService from '../services/message.service';

export async function submitContact(req: Request, res: Response) {
  const body = contactBodySchema.parse(req.body);
  await messageService.submitContactMessage(body);

  res.status(201).json({ data: { received: true } });
}

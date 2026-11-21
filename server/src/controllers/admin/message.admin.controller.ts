import type { Request, Response } from 'express';
import { idParamsSchema } from '../../validators/common.validators';
import { listMessagesQuerySchema, updateMessageSchema } from '../../validators/message.validators';
import * as messageService from '../../services/message.service';

export async function list(req: Request, res: Response) {
  const filters = listMessagesQuerySchema.parse(req.query);
  const messages = await messageService.listMessages(filters);
  res.status(200).json({ count: messages.length, data: messages });
}

export async function update(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  const { read } = updateMessageSchema.parse(req.body);
  const message = await messageService.setMessageRead(id, read);
  res.status(200).json({ data: message });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  await messageService.deleteMessage(id);
  res.status(204).send();
}

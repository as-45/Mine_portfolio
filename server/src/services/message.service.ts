import { Message } from '../models/Message';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';
import { sendContactNotification } from './email.service';
import type { ContactBody, ListMessagesQuery } from '../validators/message.validators';

export async function submitContactMessage({ website, ...data }: ContactBody) {
  if (website) {
    logger.warn('Honeypot field filled, message ignored');
    return;
  }

  await Message.create(data);

  try {
    await sendContactNotification(data);
  } catch (err) {
    logger.error({ err }, 'Saved contact message but could not send email notification');
  }
}

export async function listMessages(filters: ListMessagesQuery) {
  const query: Record<string, unknown> = {};
  if (filters.unread !== undefined) query.read = !filters.unread;

  return Message.find(query).select('-__v').sort({ createdAt: -1 }).lean();
}

export async function setMessageRead(id: string, read: boolean) {
  const message = await Message.findByIdAndUpdate(
    id,
    { $set: { read } },
    { returnDocument: 'after' },
  )
    .select('-__v')
    .lean();

  if (!message) throw AppError.notFound('Message not found');
  return message;
}

export async function deleteMessage(id: string) {
  const message = await Message.findByIdAndDelete(id).lean();
  if (!message) throw AppError.notFound('Message not found');
}

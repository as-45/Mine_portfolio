import { z } from 'zod';

export const contactBodySchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required').max(100),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email')),
  message: z
    .string({ error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
  // Honeypot: a hidden form field real visitors never see or fill in.
  website: z.string().optional(),
});

export const listMessagesQuerySchema = z.object({
  unread: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const updateMessageSchema = z.object({
  read: z.boolean({ error: 'read must be true or false' }),
});

export type ContactBody = z.infer<typeof contactBodySchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;

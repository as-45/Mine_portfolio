import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email')),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required').max(200),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

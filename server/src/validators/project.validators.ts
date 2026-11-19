import { z } from 'zod';
import { PROJECT_CATEGORIES } from '../models/Project';

export const listProjectsQuerySchema = z.object({
  category: z.enum(PROJECT_CATEGORIES).optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const slugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid project slug'),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
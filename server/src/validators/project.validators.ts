import { z } from 'zod';
import { PROJECT_CATEGORIES } from '../models/Project';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---------- Public (Phase 3) ----------

export const listProjectsQuerySchema = z.object({
  category: z.enum(PROJECT_CATEGORIES).optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const slugParamsSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(SLUG_REGEX, 'Invalid project slug'),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

// ---------- Admin (Phase 5) ----------

const optionalUrl = z.union([z.literal(''), z.url('Must be a valid URL')]);

const diagramNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(60),
  description: z.string().max(500).optional(),
  x: z.number(),
  y: z.number(),
});

const diagramEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().max(60).optional(),
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  slug: z.string().trim().toLowerCase().regex(SLUG_REGEX, 'Slug must be lowercase-words-like-this'),
  summary: z.string().trim().min(1, 'Summary is required').max(300),
  category: z.enum(PROJECT_CATEGORIES),
  role: z.string().trim().max(120).optional(),
  techStack: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  problem: z.string().max(10000).optional(),
  decisions: z
    .array(z.object({ title: z.string().trim().min(1), reason: z.string().trim().min(1) }))
    .max(20)
    .optional(),
  results: z.array(z.string().trim().min(1)).max(20).optional(),
  links: z
    .object({
      github: optionalUrl.optional(),
      live: optionalUrl.optional(),
      paper: optionalUrl.optional(),
    })
    .optional(),
  diagram: z
    .object({
      nodes: z.array(diagramNodeSchema).max(50),
      edges: z.array(diagramEdgeSchema).max(100),
    })
    .optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
});

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Send at least one field to update',
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

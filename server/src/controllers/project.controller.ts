import type { Request, Response } from 'express';
import { listProjectsQuerySchema, slugParamsSchema } from '../validators/project.validators';
import * as projectService from '../services/project.service';

export async function listProjects(req: Request, res: Response) {
  const filters = listProjectsQuerySchema.parse(req.query);
  const projects = await projectService.listPublishedProjects(filters);

  res.status(200).json({ count: projects.length, data: projects });
}

export async function getProjectBySlug(req: Request, res: Response) {
  const { slug } = slugParamsSchema.parse(req.params);
  const project = await projectService.getPublishedProjectBySlug(slug);

  res.status(200).json({ data: project });
}
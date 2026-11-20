import type { Request, Response } from 'express';
import { idParamsSchema } from '../../validators/common.validators';
import { createProjectSchema, updateProjectSchema } from '../../validators/project.validators';
import * as projectService from '../../services/project.service';

export async function listAll(_req: Request, res: Response) {
  const projects = await projectService.listAllProjects();
  res.status(200).json({ count: projects.length, data: projects });
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  const project = await projectService.getProjectById(id);
  res.status(200).json({ data: project });
}

export async function create(req: Request, res: Response) {
  const input = createProjectSchema.parse(req.body);
  const project = await projectService.createProject(input);
  res.status(201).json({ data: project });
}

export async function update(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  const input = updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(id, input);
  res.status(200).json({ data: project });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  await projectService.deleteProject(id);
  res.status(204).send();
}
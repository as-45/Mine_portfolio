import { Project } from '../models/Project';
import { AppError } from '../utils/AppError';
import type { ListProjectsQuery } from '../validators/project.validators';

const LIST_FIELDS = 'title slug summary category techStack featured order links';

export async function listPublishedProjects(filters: ListProjectsQuery) {
  const query: Record<string, unknown> = { published: true };

  if (filters.category) query.category = filters.category;
  if (filters.featured !== undefined) query.featured = filters.featured;

  return Project.find(query).select(LIST_FIELDS).sort({ order: 1 }).lean();
}

export async function getPublishedProjectBySlug(slug: string) {
  const project = await Project.findOne({ slug, published: true }).select('-__v').lean();

  if (!project) {
    throw AppError.notFound(`No project found with slug "${slug}"`);
  }

  return project;
}
import { Project } from '../models/Project';
import { AppError } from '../utils/AppError';
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from '../validators/project.validators';

const LIST_FIELDS = 'title slug summary category techStack featured order links';

// ---------- Public ----------

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

// ---------- Admin ----------

export async function listAllProjects() {
  return Project.find()
    .select(`${LIST_FIELDS} published updatedAt`)
    .sort({ order: 1, createdAt: -1 })
    .lean();
}

export async function getProjectById(id: string) {
  const project = await Project.findById(id).select('-__v').lean();
  if (!project) throw AppError.notFound('Project not found');
  return project;
}

export async function createProject(input: CreateProjectInput) {
  const project = await Project.create(input);
  return project.toObject();
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const project = await Project.findByIdAndUpdate(
    id,
    { $set: input },
    { returnDocument: 'after', runValidators: true },
  )
    .select('-__v')
    .lean();

  if (!project) throw AppError.notFound('Project not found');
  return project;
}

export async function deleteProject(id: string) {
  const project = await Project.findByIdAndDelete(id).lean();
  if (!project) throw AppError.notFound('Project not found');
}






// Function	What it does
// listAllProjects	All projects, drafts included (no published: true filter), plus published and updatedAt so you can see status
// getProjectById	One project by id, used by the admin edit form. Admin uses id, public uses slug
// createProject	Project.create validates against the schema and saves. .toObject() turns it into a plain object
// updateProject	$set changes only the fields sent; everything else stays. returnDocument: 'after' returns the updated version (the default would return the old one!). runValidators: true applies schema rules to updates too
// deleteProject	Deletes, or 404 if it didn’t exist
import request from 'supertest';
import { createApp } from '../src/app';
import { AdminUser } from '../src/models/AdminUser';
import { Project } from '../src/models/Project';
import { hashPassword } from '../src/services/auth.service';
import type { CreateProjectInput } from '../src/validators/project.validators';

export const app = createApp();

export const ADMIN = {
  email: 'admin@example.com',
  password: 'correct-horse-battery-staple',
};

export async function createAdmin() {
  const passwordHash = await hashPassword(ADMIN.password);
  return AdminUser.create({ email: ADMIN.email, passwordHash });
}

/** Returns a Supertest "agent" that keeps cookies, already logged in as admin. */
export async function loginAsAdmin() {
  await createAdmin();
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send(ADMIN).expect(200);
  return agent;
}

export function projectData(overrides: Partial<CreateProjectInput> = {}): CreateProjectInput {
  return {
    title: 'Test Project',
    slug: 'test-project',
    summary: 'A project used in tests',
    category: 'backend',
    published: true,
    ...overrides,
  };
}

export function createProject(overrides: Partial<CreateProjectInput> = {}) {
  return Project.create(projectData(overrides));
}

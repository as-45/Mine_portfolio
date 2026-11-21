import { beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent';
import { Project } from '../src/models/Project';
import { app, createProject, loginAsAdmin, projectData } from './helpers';

describe('Admin projects API', () => {
  let admin: TestAgent;

  beforeEach(async () => {
    admin = await loginAsAdmin();
  });

  it('blocks every admin route without login', async () => {
    const res = await request(app).get('/api/admin/projects');

    expect(res.status).toBe(401);
  });

  it('lists all projects including drafts', async () => {
    await createProject({ slug: 'live' });
    await createProject({ slug: 'draft', published: false });

    const res = await admin.get('/api/admin/projects');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  describe('POST /api/admin/projects', () => {
    it('creates a project and applies database defaults', async () => {
      const res = await admin.post('/api/admin/projects').send(projectData({ slug: 'brand-new' }));

      expect(res.status).toBe(201);
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.featured).toBe(false);
      expect(res.body.data.techStack).toEqual([]);
      expect(await Project.countDocuments()).toBe(1);
    });

    it('rejects invalid data with field details', async () => {
      const res = await admin
        .post('/api/admin/projects')
        .send({ title: '', slug: 'Bad Slug', category: 'mobile' });

      expect(res.status).toBe(400);
      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields).toEqual(expect.arrayContaining(['title', 'slug', 'summary', 'category']));
    });

    it('rejects a duplicate slug with 409', async () => {
      await createProject({ slug: 'taken' });

      const res = await admin.post('/api/admin/projects').send(projectData({ slug: 'taken' }));

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('That slug is already in use');
    });

    it('rejects broken JSON with 400', async () => {
      const res = await admin
        .post('/api/admin/projects')
        .set('Content-Type', 'application/json')
        .send('{ "title":');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('InvalidJSON');
    });
  });

  describe('PATCH /api/admin/projects/:id', () => {
    it('updates only the fields sent', async () => {
      const project = await createProject({ slug: 'to-edit', published: false, featured: true });

      const res = await admin.patch(`/api/admin/projects/${project.id}`).send({ published: true });

      expect(res.status).toBe(200);
      expect(res.body.data.published).toBe(true);
      expect(res.body.data.featured).toBe(true);
      expect(res.body.data.title).toBe('Test Project');
    });

    it('rejects an empty update with 400', async () => {
      const project = await createProject();

      const res = await admin.patch(`/api/admin/projects/${project.id}`).send({});

      expect(res.status).toBe(400);
    });

    it('rejects an invalid id with 400', async () => {
      const res = await admin.patch('/api/admin/projects/123').send({ published: true });

      expect(res.status).toBe(400);
      expect(res.body.details[0].message).toBe('Invalid id');
    });

    it('returns 404 for an id that does not exist', async () => {
      const res = await admin
        .patch('/api/admin/projects/0123456789abcdef01234567')
        .send({ published: true });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/admin/projects/:id', () => {
    it('deletes the project with 204', async () => {
      const project = await createProject();

      const res = await admin.delete(`/api/admin/projects/${project.id}`);

      expect(res.status).toBe(204);
      expect(await Project.countDocuments()).toBe(0);
    });

    it('returns 404 when deleting twice', async () => {
      const project = await createProject();
      await admin.delete(`/api/admin/projects/${project.id}`).expect(204);

      const res = await admin.delete(`/api/admin/projects/${project.id}`);

      expect(res.status).toBe(404);
    });
  });
});

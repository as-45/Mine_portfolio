import { beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { app, createProject } from './helpers';

describe('Public projects API', () => {
  beforeEach(async () => {
    await createProject({ slug: 'second', title: 'Second', category: 'genai', order: 2 });
    await createProject({ slug: 'first', title: 'First', featured: true, order: 1 });
    await createProject({ slug: 'secret-draft', title: 'Draft', published: false, order: 0 });
  });

  describe('GET /api/projects', () => {
    it('lists only published projects, sorted by order', async () => {
      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual(['first', 'second']);
    });

    it('does not include heavy fields in the list', async () => {
      const res = await request(app).get('/api/projects');

      expect(res.body.data[0]).not.toHaveProperty('diagram');
      expect(res.body.data[0]).not.toHaveProperty('problem');
    });

    it('filters by category', async () => {
      const res = await request(app).get('/api/projects?category=genai');

      expect(res.body.count).toBe(1);
      expect(res.body.data[0].slug).toBe('second');
    });

    it('filters by featured=true', async () => {
      const res = await request(app).get('/api/projects?featured=true');

      expect(res.body.count).toBe(1);
      expect(res.body.data[0].slug).toBe('first');
    });

    it('rejects an unknown category with 400', async () => {
      const res = await request(app).get('/api/projects?category=mobile');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ValidationError');
      expect(res.body.details[0].field).toBe('category');
    });
  });

  describe('GET /api/projects/:slug', () => {
    it('returns the full project', async () => {
      const res = await request(app).get('/api/projects/first');

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('First');
      expect(res.body.data).toHaveProperty('diagram');
    });

    it('is case-insensitive', async () => {
      const res = await request(app).get('/api/projects/FIRST');

      expect(res.status).toBe(200);
    });

    it('hides drafts with 404', async () => {
      const res = await request(app).get('/api/projects/secret-draft');

      expect(res.status).toBe(404);
    });

    it('returns 404 for a slug that does not exist', async () => {
      const res = await request(app).get('/api/projects/nope');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NotFound');
    });

    it('rejects an invalid slug with 400', async () => {
      const res = await request(app).get('/api/projects/bad_slug!');

      expect(res.status).toBe(400);
    });
  });
});

import { beforeEach, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { ADMIN, app, createAdmin } from './helpers';

describe('Auth API', () => {
  beforeEach(async () => {
    await createAdmin();
  });

  describe('POST /api/auth/login', () => {
    it('logs in and sets an httpOnly cookie', async () => {
      const res = await request(app).post('/api/auth/login').send(ADMIN);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(ADMIN.email);

      const cookie = String(res.headers['set-cookie']);
      expect(cookie).toContain('portfolio_token=');
      expect(cookie).toContain('HttpOnly');
    });

    it('never returns the token or password hash in the body', async () => {
      const res = await request(app).post('/api/auth/login').send(ADMIN);

      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
      expect(res.body.data).not.toHaveProperty('token');
    });

    it('accepts the email with different case and spaces', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '  Admin@Example.com ', password: ADMIN.password });

      expect(res.status).toBe(200);
    });

    it('rejects a wrong password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: ADMIN.email, password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('gives the SAME message for an unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'whatever' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('rejects a missing password with 400', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email });

      expect(res.status).toBe(400);
      expect(res.body.details[0].field).toBe('password');
    });
  });

  describe('GET /api/auth/me and logout', () => {
    it('returns 401 without a cookie', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('returns 401 for a fake token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'portfolio_token=fake.token.here');

      expect(res.status).toBe(401);
    });

    it('works after login and stops working after logout', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/login').send(ADMIN).expect(200);

      const meRes = await agent.get('/api/auth/me');
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.email).toBe(ADMIN.email);

      await agent.post('/api/auth/logout').expect(200);

      const afterLogout = await agent.get('/api/auth/me');
      expect(afterLogout.status).toBe(401);
    });
  });
});

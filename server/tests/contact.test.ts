import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { Message } from '../src/models/Message';
import { sendContactNotification } from '../src/services/email.service';
import { app, loginAsAdmin } from './helpers';

jest.mock('../src/services/email.service');
const mockedSendEmail = jest.mocked(sendContactNotification);

const validMessage = {
  name: 'Test Recruiter',
  email: 'recruiter@example.com',
  message: 'Hi Athreya, I would like to talk about a role.',
};

describe('Contact form + admin messages', () => {
  beforeEach(() => {
    mockedSendEmail.mockReset();
    mockedSendEmail.mockResolvedValue(undefined);
  });

  describe('POST /api/contact', () => {
    it('saves the message and sends an email', async () => {
      const res = await request(app).post('/api/contact').send(validMessage);

      expect(res.status).toBe(201);
      expect(await Message.countDocuments()).toBe(1);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
    });

    it('still succeeds if the email fails (graceful degradation)', async () => {
      mockedSendEmail.mockRejectedValue(new Error('Resend is down'));

      const res = await request(app).post('/api/contact').send(validMessage);

      expect(res.status).toBe(201);
      expect(await Message.countDocuments()).toBe(1);
    });

    it('silently drops spam bots that fill the honeypot', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ ...validMessage, website: 'spam.com' });

      expect(res.status).toBe(201);
      expect(await Message.countDocuments()).toBe(0);
      expect(mockedSendEmail).not.toHaveBeenCalled();
    });

    it('rejects invalid input with 400', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'A', email: 'nope', message: 'short' });

      expect(res.status).toBe(400);
      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields).toEqual(expect.arrayContaining(['email', 'message']));
    });
  });

  describe('Admin messages', () => {
    it('requires login', async () => {
      const res = await request(app).get('/api/admin/messages');

      expect(res.status).toBe(401);
    });

    it('lists unread messages, marks one read, then deletes it', async () => {
      const admin = await loginAsAdmin();
      await request(app).post('/api/contact').send(validMessage).expect(201);

      const unread = await admin.get('/api/admin/messages?unread=true');
      expect(unread.body.count).toBe(1);
      const id = unread.body.data[0]._id;

      const marked = await admin.patch(`/api/admin/messages/${id}`).send({ read: true });
      expect(marked.status).toBe(200);
      expect(marked.body.data.read).toBe(true);

      const unreadAfter = await admin.get('/api/admin/messages?unread=true');
      expect(unreadAfter.body.count).toBe(0);

      await admin.delete(`/api/admin/messages/${id}`).expect(204);
      expect(await Message.countDocuments()).toBe(0);
    });
  });
});

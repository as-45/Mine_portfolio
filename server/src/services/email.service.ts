import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../config/logger';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface ContactNotification {
  name: string;
  email: string;
  message: string;
}

export async function sendContactNotification({ name, email, message }: ContactNotification) {
  if (!resend || !env.CONTACT_TO_EMAIL) {
    logger.info('Email not configured (RESEND_API_KEY / CONTACT_TO_EMAIL missing), skipping');
    return;
  }

  const { error } = await resend.emails.send({
    from: 'Portfolio Contact <onboarding@resend.dev>',
    to: env.CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `New portfolio message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }
}

import nodemailer from 'nodemailer';
import { Env } from '@/libs/Env';

export const isMailConfigured = () =>
  Boolean(Env.SMTP_HOST && Env.SMTP_USER && Env.SMTP_PASSWORD);

export const sendMail = async (input: { to: string; subject: string; text: string }) => {
  if (!isMailConfigured()) {
    throw new Error('SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)');
  }

  const transport = nodemailer.createTransport({
    host: Env.SMTP_HOST,
    port: Env.SMTP_PORT,
    secure: Env.SMTP_PORT === 465,
    auth: { user: Env.SMTP_USER, pass: Env.SMTP_PASSWORD },
  });

  await transport.sendMail({
    from: Env.SMTP_FROM ?? Env.SMTP_USER,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
};

import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const Env = createEnv({
  server: {
    CLERK_SECRET_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    PAYPHONE_AUTH_TOKEN: z.string().min(1),
    PAYPHONE_STORE_ID: z.string().optional(),
    VENICE_API_KEY: z.string().min(1),
    VENICE_MODEL: z.string().min(1).default('venice-uncensored-1-2'),
    VENICE_IMAGE_MODEL: z.string().min(1).default('lustify-sdxl'),
    VENICE_BALANCE_ALERT_USD: z.coerce.number().positive().default(50),
    CRON_SECRET: z.string().optional(),
    ADMIN_EMAILS: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().default(465),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_LOGGING_LEVEL: z.enum(['error', 'info', 'debug', 'warning', 'trace', 'fatal']).default('info'),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    PAYPHONE_AUTH_TOKEN: process.env.PAYPHONE_AUTH_TOKEN,
    PAYPHONE_STORE_ID: process.env.PAYPHONE_STORE_ID,
    VENICE_API_KEY: process.env.VENICE_API_KEY,
    VENICE_MODEL: process.env.VENICE_MODEL,
    VENICE_IMAGE_MODEL: process.env.VENICE_IMAGE_MODEL,
    VENICE_BALANCE_ALERT_USD: process.env.VENICE_BALANCE_ALERT_USD,
    CRON_SECRET: process.env.CRON_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_LOGGING_LEVEL: process.env.NEXT_PUBLIC_LOGGING_LEVEL,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST,
    NODE_ENV: process.env.NODE_ENV,
  },
});

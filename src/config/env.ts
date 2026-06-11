import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOSTNAME: z.string().default('localhost'),

  MONGODB_URI: z.string().url().startsWith('mongodb'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  COOKIE_SECRET: z.string().min(32).default(''),
  CSRF_SECRET: z.string().min(32).default(''),

  ARGON2_TIME_COST: z.coerce.number().int().positive().default(3),
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(65536),

  WHATSAPP_SESSION_PATH: z.string().default('.wwebjs_auth'),

  UPLOAD_MAX_SIZE: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  UPLOAD_DIR: z.string().default('./uploads'),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_DIR: z.string().default('./logs'),
});

function validateEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();

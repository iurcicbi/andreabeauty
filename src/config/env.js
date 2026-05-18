const { z } = require('zod');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOSTNAME: z.string().default('localhost'),

  MONGODB_URI: z.string().url().startsWith('mongodb'),
  REDIS_URL: z.string().url().startsWith('rediss://').or(z.string().startsWith('redis://')),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  COOKIE_SECRET: z.string().min(32).default(''),
  CSRF_SECRET: z.string().min(32).default(''),

  ARGON2_TIME_COST: z.coerce.number().int().positive().default(3),
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(65536),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_LOGIN: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_MAX_BOOKING: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_MAX_ADMIN: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_MAX_WHATSAPP: z.coerce.number().int().positive().default(20),

  WHATSAPP_SESSION_PATH: z.string().default('.wwebjs_auth'),
  WHATSAPP_WORKER_CONCURRENCY: z.coerce.number().int().positive().default(1),

  UPLOAD_MAX_SIZE: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  UPLOAD_DIR: z.string().default('./uploads'),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_DIR: z.string().default('./logs'),

  MONITOR_PORT: z.coerce.number().int().positive().default(9090),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Environment validation failed:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

const env = validateEnv();

module.exports = { env };

import zod from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = zod.object({
  NODE_ENV: zod.enum(['development', 'production', 'test']),
  PORT: zod.string()
    .optional()
    .default('8080')
    .transform((val) => parseInt(val, 10)),
  DB_URL: zod.string().min(1, 'DB_URL is required'),
  GOOGLE_API_KEY: zod.string().min(1, 'GOOGLE_API_KEY is required'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.format());
  process.exit(1);
}

const env = result.data;

export default env;
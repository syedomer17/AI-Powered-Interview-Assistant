import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("4000"),
  MONGODB_URI: z.string().url().or(z.string().startsWith("mongodb://")),
  GEMINI_API_KEY: z.string().min(10, "GEMINI_API_KEY missing or too short"),
  ALLOWED_ORIGINS: z.string().optional(),
  IP_ORIGINS: z.string().optional(),
  LOCAL_ORIGIN: z.string().optional(),
  SERVER_ORIGIN: z.string().optional()
});

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error("❌ Invalid environment variables:\n", _env.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _env.data;

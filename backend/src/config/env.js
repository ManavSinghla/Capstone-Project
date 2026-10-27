/**
 * env.js — validated environment configuration
 *
 * Reads process.env at startup and fails fast with clear messages
 * when required variables are missing or invalid.
 * Uses Zod for runtime schema validation — no silent bad defaults.
 */

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1024).max(65535).default(5000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  OCR_SERVICE_URL: z.string().url('OCR_SERVICE_URL must be a valid HTTP URL'),
  OCR_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(15000),
  STORAGE_DIR: z.string().min(1).default('./storage/uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().min(1).max(50).default(15),
  ALLOWED_MIME_TYPES: z
    .string()
    .default('image/jpeg,image/png,image/webp,image/tiff')
    .transform((s) => s.split(',').map((t) => t.trim())),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('[CONFIG ERROR] Invalid environment variables:\n');
  result.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  console.error('\nCopy backend/.env.example to backend/.env and set real values.\n');
  process.exit(1);
}

export const env = Object.freeze(result.data);

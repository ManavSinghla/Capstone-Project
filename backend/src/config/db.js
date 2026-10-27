/**
 * db.js — PrismaClient singleton
 *
 * Imports and re-exports a single shared PrismaClient instance.
 * Avoids creating multiple connection pools in development
 * when Node hot-reloads modules.
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

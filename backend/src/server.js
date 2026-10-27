/**
 * server.js — HTTP server entry point
 *
 * Starts the Express app. Separate from app.js to allow tests to
 * import app.js without binding a port.
 */

import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';

const server = app.listen(env.PORT, () => {
  console.log(`[INFO] Legal Metrology backend running on port ${env.PORT} (${env.NODE_ENV})`);
});

// Graceful shutdown on SIGTERM (e.g. docker stop, PM2 restart)
process.on('SIGTERM', async () => {
  console.log('[INFO] SIGTERM received — closing server.');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[INFO] Server and database connection closed.');
    process.exit(0);
  });
});

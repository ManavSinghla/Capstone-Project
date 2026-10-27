/**
 * app.js — Express application bootstrap
 *
 * Order matters:
 *  1. Security headers (helmet)
 *  2. CORS
 *  3. Request logging (morgan)
 *  4. Body parsers
 *  5. API routes
 *  6. 404 handler
 *  7. Centralised error handler (must be last)
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRouter from './routes/api.router.js';

const app = express();

// --- Security & Utility Middleware -------------------------------------------
app.use(helmet());
app.use(cors({ origin: env.NODE_ENV === 'development' ? '*' : false }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// --- Routes ------------------------------------------------------------------
app.use('/api/v1', apiRouter);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'legal-metrology-backend', env: env.NODE_ENV })
);

// --- 404 ---------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
});

// --- Centralised Error Handler (must be last) --------------------------------
app.use(errorHandler);

export default app;

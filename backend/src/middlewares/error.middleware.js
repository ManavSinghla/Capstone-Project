/**
 * error.middleware.js — Centralised Express error handler
 *
 * Must be registered LAST in Express (after all routes).
 * Ensures no stack traces or internal details leak to API consumers.
 */

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.statusCode ?? err.status ?? 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path} ? ${status}:`, err.message);
  }

  // Never expose raw error messages or stack traces in production.
  const message =
    status < 500
      ? err.message
      : 'An unexpected server error occurred. Please try again later.';

  res.status(status).json({ success: false, error: message });
}

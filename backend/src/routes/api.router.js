/**
 * api.router.js — Top-level API router
 * All routes are mounted under /api/v1 (set in app.js).
 */

import { Router } from 'express';

const router = Router();

// -- Placeholder routes for Milestone 1 --------------------------------------
// Full inspection controller is implemented in Milestone 3.
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Legal Metrology Compliance API is running.',
    milestone: 1,
  });
});

export default router;

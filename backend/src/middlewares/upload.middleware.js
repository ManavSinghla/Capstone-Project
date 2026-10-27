/**
 * upload.middleware.js — Multer file upload configuration
 *
 * Security measures:
 *   1. File extension is replaced with a UUID-based random name
 *      to prevent directory traversal and filename collisions.
 *   2. MIME type is validated via Multer fileFilter.
 *   3. Maximum file size is enforced from env config.
 *   4. Files land in STORAGE_DIR/{inspection-id}/ once the
 *      inspection record is created. The inspection-id is taken
 *      from req.body.inspectionId set by the route handler.
 *
 * NOTE: MIME magic number validation (beyond MIME type header)
 * should be added in Milestone 4 using the 'file-type' npm package.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env.js';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Use a temporary "pending" directory until inspection ID is assigned.
    const dir = path.join(env.STORAGE_DIR, 'pending');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    // Random UUID name + original extension stripped to lowercase safe ext.
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = ['.jpg', '.jpeg', '.png', '.webp', '.tiff'].includes(ext) ? ext : '.bin';
    cb(null, `${crypto.randomUUID()}${safe}`);
  },
});

function fileFilter(req, file, cb) {
  if (env.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Unsupported file type: ${file.mimetype}. ` +
      `Allowed types: ${env.ALLOWED_MIME_TYPES.join(', ')}`
    );
    err.statusCode = 422;
    cb(err, false);
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    files: 6, // Maximum 6 panel images per inspection
  },
});

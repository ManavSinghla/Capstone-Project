/**
 * upload.middleware.js — Multer file upload configuration with Magic Number Security Validation
 *
 * Security measures:
 *   1. File extension is replaced with a UUID-based random name
 *      to prevent directory traversal and filename collisions (NFR-3.2).
 *   2. MIME type is validated via Multer fileFilter allowlist.
 *   3. Maximum file size is enforced from env config.
 *   4. MIME magic number binary validation (Milestone 4 — NFR-3.1):
 *      Inspects the initial byte headers of saved files to prevent
 *      spoofed extensions (e.g. polyglot executables renamed to .jpg).
 *      Mismatched files are immediately unlinked from disk and rejected with HTTP 422.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env.js';

// --- Magic byte signatures for image formats ---
const SIGNATURES = [
  {
    mime: 'image/jpeg',
    check: (buf) => buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF,
  },
  {
    mime: 'image/png',
    check: (buf) => buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47,
  },
  {
    mime: 'image/webp',
    check: (buf) =>
      buf.length >= 12 &&
      buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buf.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    mime: 'image/gif',
    check: (buf) => buf.length >= 3 && buf.subarray(0, 3).toString('ascii') === 'GIF',
  },
  {
    mime: 'image/tiff',
    check: (buf) =>
      buf.length >= 4 &&
      ((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0x00) ||
       (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0x00 && buf[3] === 0x2A)),
  },
];

/**
 * validateMagicBytes(filePath, declaredMime)
 * Reads the first 16 bytes of the file and validates against known image signatures.
 */
export function validateMagicBytes(filePath, declaredMime) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, header, 0, 16, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) return false;

    const matchedSig = SIGNATURES.find((s) => s.mime === declaredMime);
    if (!matchedSig) {
      // If we don't have a specific signature rule, ensure it's not a known dangerous header (e.g. MZ, ELF, shell)
      const text = header.subarray(0, 4).toString('ascii');
      if (text.startsWith('MZ') || text.startsWith('\x7fELF') || text.startsWith('#!')) {
        return false;
      }
      return true;
    }
    return matchedSig.check(header);
  } catch {
    return false;
  }
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(env.STORAGE_DIR, 'pending');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.gif'].includes(ext) ? ext : '.bin';
    cb(null, `${crypto.randomUUID()}${safe}`);
  },
});

function fileFilter(req, file, cb) {
  if (env.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Unsupported file type: ${file.mimetype}. Allowed types: ${env.ALLOWED_MIME_TYPES.join(', ')}`
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
    files: 6,
  },
});

/**
 * magicNumberValidationMiddleware
 * Express middleware to be invoked after multer.
 * Verifies magic bytes of all uploaded files; deletes invalid files and responds with 422.
 */
export function magicNumberValidationMiddleware(req, res, next) {
  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : (req.file ? [req.file] : []);
  if (files.length === 0) return next();

  for (const file of files) {
    if (!validateMagicBytes(file.path, file.mimetype)) {
      // Clean up uploaded files to avoid leaving bad data on disk
      for (const f of files) {
        try { fs.unlinkSync(f.path); } catch { /* ignore */ }
      }
      return res.status(422).json({
        success: false,
        error: 'File content does not match declared MIME type (magic bytes mismatch). Upload rejected for security.',
        filename: file.originalname,
      });
    }
  }

  next();
}

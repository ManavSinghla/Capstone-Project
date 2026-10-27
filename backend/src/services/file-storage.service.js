/**
 * file-storage.service.js — Safe file I/O and SHA-256 checksum generation
 *
 * Uses Node.js built-in crypto and fs/promises — no external dependencies.
 * Keeps uploaded files exactly once on disk under STORAGE_DIR.
 */

import { createHash } from 'crypto';
import { createReadStream, promises as fsp } from 'fs';
import path from 'path';
import { env } from '../config/env.js';

/**
 * Computes SHA-256 hex digest of a file on disk.
 * @param {string} filePath - Absolute path to file
 * @returns {Promise<string>} hex string
 */
export async function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    createReadStream(filePath)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject);
  });
}

/**
 * Moves an uploaded file from the temp "pending" area to the
 * final inspection-specific directory.
 *
 * @param {string} tempPath      - Path returned by multer
 * @param {string} inspectionId  - UUID of the inspection record
 * @param {string} filename      - Sanitized filename (as saved by multer)
 * @returns {Promise<string>}    - Final relative path (relative to STORAGE_DIR)
 */
export async function moveToInspectionDir(tempPath, inspectionId, filename) {
  const destDir = path.join(env.STORAGE_DIR, inspectionId);
  await fsp.mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, filename);
  await fsp.rename(tempPath, destPath);
  // Return relative path for storage in DB (not absolute, for portability).
  return path.join(inspectionId, filename);
}

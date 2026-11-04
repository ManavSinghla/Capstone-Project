/**
 * ocr-client.service.js - HTTP client communicating with Python FastAPI OCR service
 *
 * Uses native fetch (Node 18+) with streaming multipart FormData.
 * Keeps OCR service isolated: no shared disk mounts or external npm packages required.
 */

import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

/**
 * Sends an image file from disk to the OCR microservice.
 *
 * @param {string} filePath - Absolute path to the image file on server
 * @param {string} panelType - PanelType enum ('PDP', 'BACK', etc.)
 * @returns {Promise<Object>}
 */
export async function sendImageToOcrService(filePath, panelType = 'PDP') {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Image file not found at path: ${filePath}`);
  }

  const fileName = path.basename(filePath);
  const fileBytes = await fs.promises.readFile(filePath);
  const fileBlob = new Blob([fileBytes]);

  const formData = new FormData();
  formData.append('file', fileBlob, fileName);
  formData.append('panel_type', panelType);

  try {
    const response = await fetch(env.OCR_SERVICE_URL, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(env.OCR_TIMEOUT_MS),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let detail = errorText;
      try {
        const json = JSON.parse(errorText);
        detail = json.detail || json.message || errorText;
      } catch {
        // use raw errorText
      }
      throw new Error(`OCR service HTTP ${response.status}: ${detail}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error(
        `OCR request timed out after ${env.OCR_TIMEOUT_MS}ms. The image may be too large or complex.`
      );
    }
    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      throw new Error(
        `OCR service unreachable at ${env.OCR_SERVICE_URL}. Ensure the Python FastAPI service is running.`
      );
    }
    throw error;
  }
}

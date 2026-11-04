/**
 * ocr-client.service.js - HTTP client communicating with Python FastAPI OCR service
 *
 * Streams image buffer to the OCR microservice over private HTTP.
 * Keeps OCR service isolated: no shared disk mounts required.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

/**
 * Sends an image file from disk to the OCR microservice.
 *
 * @param {string} filePath - Absolute path to the image file on server
 * @param {string} panelType - PanelType enum ('PDP', 'BACK', etc.)
 * @returns {Promise<import('../../ocr-service/app/schemas/ocr_schemas.py').OcrResponse>}
 */
export async function sendImageToOcrService(filePath, panelType = 'PDP') {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Image file not found at path: ${filePath}`);
  }

  const fileStream = fs.createReadStream(filePath);
  const fileName = path.basename(filePath);

  const formData = new FormData();
  const fileBlob = new Blob([await fs.promises.readFile(filePath)]);
  formData.append('file', fileBlob, fileName);
  formData.append('panel_type', panelType);

  try {
    const response = await axios.post(env.OCR_SERVICE_URL, formData, {
      timeout: env.OCR_TIMEOUT_MS,
      headers: {
        'Accept': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `OCR service unreachable at ${env.OCR_SERVICE_URL}. Ensure the Python FastAPI service is running.`
      );
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error(
        `OCR request timed out after ${env.OCR_TIMEOUT_MS}ms. The image may be too large or complex.`
      );
    }
    const detail = error.response?.data?.detail || error.message;
    throw new Error(`OCR service failed: ${detail}`);
  }
}


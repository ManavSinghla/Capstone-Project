/**
 * ocr-client.test.js - Unit tests for Express OCR client service
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { sendImageToOcrService } from '../src/services/ocr-client.service.js';

describe('OCR Client Service', () => {
  test('throws meaningful error when file does not exist', async () => {
    await assert.rejects(
      async () => {
        await sendImageToOcrService('./non_existent_image_12345.jpg');
      },
      {
        message: /Image file not found at path:/,
      }
    );
  });
});

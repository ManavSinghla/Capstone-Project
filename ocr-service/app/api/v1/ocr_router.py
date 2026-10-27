"""
ocr_router.py - OCR processing endpoint

POST /api/v1/ocr/process-image
  Accepts: multipart/form-data with image file + panel_type
  Returns: OcrResponse JSON

The concrete OCR engine is injected at startup via the app state.
In production: PaddleOCREngine
In testing:    MockOCREngine (no model weights required)
"""

import time
import uuid
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from ...schemas.ocr_schemas import OcrResponse, ImageMetadata, PanelType
from ...preprocessing.quality_checker import assess_quality
from ...preprocessing.image_cleaner import preprocess
from ...core.config import settings

router = APIRouter()


@router.post("/process-image", response_model=OcrResponse)
async def process_image(
    request: Request,
    file: UploadFile = File(...),
    panel_type: PanelType = Form(PanelType.PDP),
    enhance_resolution: bool = Form(False),
) -> OcrResponse:
    """
    Preprocess the uploaded image and run OCR text extraction.

    Returns structured text blocks with bounding boxes and confidence scores.
    The caller (Express backend) is responsible for persisting the result.
    This endpoint is stateless — it does NOT store images to disk.
    """
    start_ms = int(time.time() * 1000)

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.max_image_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds maximum allowed size of {settings.MAX_IMAGE_SIZE_MB}MB.",
        )

    # Decode image from bytes
    arr = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=422, detail="Could not decode image. Ensure the file is a valid JPEG, PNG, WEBP, or TIFF.")

    h, w, c = image.shape

    # Quality assessment on original (before preprocessing)
    quality = assess_quality(image)

    # Preprocessing
    processed = preprocess(image)

    # OCR extraction via injected engine
    engine = request.app.state.ocr_engine
    text_blocks = engine.extract(processed)

    full_text = "\n".join(b.text for b in text_blocks)
    elapsed_ms = int(time.time() * 1000) - start_ms

    return OcrResponse(
        success=True,
        processing_time_ms=elapsed_ms,
        image_metadata=ImageMetadata(
            width=w,
            height=h,
            channels=c,
            blur_score=quality["blur_score"],
            is_blurry=quality["is_blurry"],
            glare_percentage=quality["glare_percentage"],
        ),
        text_blocks=text_blocks,
        full_extracted_text=full_text,
    )

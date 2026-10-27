"""
ocr_schemas.py - Pydantic schemas for OCR request/response

These types form the HTTP contract between Express and FastAPI.
Any change here must be reflected in backend/src/services/ocr-client.service.js.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class PanelType(str, Enum):
    PDP = "PDP"
    BACK = "BACK"
    SIDE_LEFT = "SIDE_LEFT"
    SIDE_RIGHT = "SIDE_RIGHT"
    TOP = "TOP"
    BOTTOM = "BOTTOM"


class BoundingBox(BaseModel):
    x_min: int
    y_min: int
    x_max: int
    y_max: int


class TextBlock(BaseModel):
    id: str
    text: str
    confidence: float = Field(ge=0.0, le=1.0)
    bounding_box: BoundingBox
    estimated_font_height_px: Optional[float] = None


class ImageMetadata(BaseModel):
    width: int
    height: int
    channels: int
    blur_score: float
    is_blurry: bool
    glare_percentage: Optional[float] = None


class OcrResponse(BaseModel):
    success: bool
    processing_time_ms: int
    image_metadata: ImageMetadata
    text_blocks: list[TextBlock]
    full_extracted_text: str

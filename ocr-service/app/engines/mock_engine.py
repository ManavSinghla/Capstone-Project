"""
mock_engine.py - Deterministic mock OCR engine for testing

Returns a fixed response regardless of input image content.
Used in CI/CD pipelines and unit tests to validate the OCR HTTP contract
without loading PaddleOCR model weights (~200MB).
"""

import uuid
import numpy as np
from .base import AbstractOCREngine
from ..schemas.ocr_schemas import TextBlock, BoundingBox

MOCK_BLOCKS = [
    TextBlock(
        id=str(uuid.uuid4()),
        text="MRP Rs. 120.00 (Incl. of all taxes)",
        confidence=0.985,
        bounding_box=BoundingBox(x_min=140, y_min=820, x_max=580, y_max=865),
        estimated_font_height_px=38.5,
    ),
    TextBlock(
        id=str(uuid.uuid4()),
        text="Net Wt: 200 g",
        confidence=0.962,
        bounding_box=BoundingBox(x_min=140, y_min=780, x_max=350, y_max=815),
        estimated_font_height_px=30.0,
    ),
    TextBlock(
        id=str(uuid.uuid4()),
        text="Unit Sale Price: Rs. 0.60/g",
        confidence=0.941,
        bounding_box=BoundingBox(x_min=140, y_min=875, x_max=490, y_max=910),
        estimated_font_height_px=28.0,
    ),
]


class MockOCREngine(AbstractOCREngine):
    """Returns fixed blocks for any image. Use in tests only."""

    def extract(self, image: np.ndarray) -> list[TextBlock]:
        return MOCK_BLOCKS

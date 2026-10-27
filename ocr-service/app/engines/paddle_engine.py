"""
paddle_engine.py - PaddleOCR concrete implementation of AbstractOCREngine

This file is ONLY imported when paddlepaddle is installed.
If paddlepaddle is absent, main.py falls back to MockOCREngine.

Milestone 1: Scaffold only — actual PaddleOCR wiring is implemented in Milestone 2.
"""

import uuid
import numpy as np
from .base import AbstractOCREngine
from ..schemas.ocr_schemas import TextBlock, BoundingBox


class PaddleOCREngine(AbstractOCREngine):
    """
    PaddleOCR text detection and recognition engine.
    Model weights are loaded once at startup; shared across all requests.

    NOTE: Full implementation is in Milestone 2.
    """

    def __init__(self, use_gpu: bool = False):
        # Import deferred to keep import-time fast when paddle is not installed.
        from paddleocr import PaddleOCR  # noqa: PLC0415
        self._ocr = PaddleOCR(
            use_angle_cls=True,  # Detect rotated text
            lang="en",           # English primary; Hindi support in Milestone 2
            use_gpu=use_gpu,
            show_log=False,
        )

    def extract(self, image: np.ndarray) -> list[TextBlock]:
        """
        Run PaddleOCR on the preprocessed image.

        Args:
            image: Preprocessed grayscale or BGR numpy array.

        Returns:
            List of TextBlock objects.
        """
        results = self._ocr.ocr(image, cls=True)
        blocks = []
        for line in (results or []):
            if not line:
                continue
            for item in line:
                bbox_pts, (text, conf) = item
                if not text or not text.strip():
                    continue
                # PaddleOCR returns [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] (quad)
                xs = [int(p[0]) for p in bbox_pts]
                ys = [int(p[1]) for p in bbox_pts]
                blocks.append(TextBlock(
                    id=str(uuid.uuid4()),
                    text=text.strip(),
                    confidence=round(float(conf), 4),
                    bounding_box=BoundingBox(
                        x_min=min(xs), y_min=min(ys),
                        x_max=max(xs), y_max=max(ys),
                    ),
                    estimated_font_height_px=float(max(ys) - min(ys)),
                ))
        return blocks

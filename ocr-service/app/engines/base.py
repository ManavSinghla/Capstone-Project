"""
base.py - Abstract OCR Engine interface

All concrete OCR engines (PaddleOCR, Tesseract, mock) must implement
this interface. The router and preprocessing pipeline depend only on
this abstract class -- never on a concrete engine.

This is the modularity guarantee: swapping PaddleOCR for any other
engine only requires a new class implementing AbstractOCREngine.
"""

from abc import ABC, abstractmethod
import numpy as np
from ..schemas.ocr_schemas import TextBlock


class AbstractOCREngine(ABC):
    """
    Abstract base for all OCR engines.

    Implementations must be stateless with respect to individual requests.
    Shared state (e.g. loaded model weights) is initialised in __init__
    and must be thread-safe.
    """

    @abstractmethod
    def extract(self, image: np.ndarray) -> list[TextBlock]:
        """
        Run text detection and recognition on a pre-processed image.

        Args:
            image: OpenCV BGR image array, already pre-processed.

        Returns:
            List of TextBlock objects with text, confidence, and bounding box.
        """
        raise NotImplementedError

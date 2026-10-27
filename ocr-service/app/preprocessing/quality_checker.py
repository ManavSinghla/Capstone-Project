"""
quality_checker.py - Image quality assessment before OCR

Uses OpenCV (no ML required) to assess:
  - Blur (Laplacian variance method)
  - Approximate glare percentage (overexposed pixel ratio)

These metrics are returned in the OCR response so Express can
flag images that may produce unreliable OCR results.
"""

import cv2
import numpy as np


BLUR_THRESHOLD = 100.0  # Laplacian variance below this -> image is blurry
GLARE_THRESHOLD = 240   # Pixel brightness above this -> considered glare


def compute_blur_score(image: np.ndarray) -> float:
    """
    Compute the Laplacian variance of the image.
    Higher values = sharper image.
    Values below BLUR_THRESHOLD are considered too blurry for reliable OCR.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def compute_glare_percentage(image: np.ndarray) -> float:
    """
    Estimate the percentage of pixels that are overexposed (glare).
    Returns a value in [0.0, 100.0].
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    total = gray.size
    bright = int(np.sum(gray > GLARE_THRESHOLD))
    return round((bright / total) * 100, 2) if total > 0 else 0.0


def assess_quality(image: np.ndarray) -> dict:
    """
    Run all quality checks and return a quality report dict.

    Returns:
        {
            "blur_score": float,
            "is_blurry": bool,
            "glare_percentage": float,
        }
    """
    blur_score = compute_blur_score(image)
    glare_pct = compute_glare_percentage(image)
    return {
        "blur_score": round(blur_score, 2),
        "is_blurry": blur_score < BLUR_THRESHOLD,
        "glare_percentage": glare_pct,
    }

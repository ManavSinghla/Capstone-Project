"""
image_cleaner.py - OpenCV image preprocessing pipeline

Applies a sequence of transformations to improve OCR accuracy:
  1. Convert to grayscale
  2. Bilateral filter (reduce noise, preserve edges)
  3. Adaptive thresholding (handle uneven lighting)
  4. Deskew (rotate to correct small tilts)

Each step is a pure function operating on numpy arrays.
"""

import cv2
import numpy as np


def to_grayscale(image: np.ndarray) -> np.ndarray:
    if len(image.shape) == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image


def denoise(image: np.ndarray) -> np.ndarray:
    """Bilateral filter — reduces noise while keeping text edges sharp."""
    return cv2.bilateralFilter(image, d=9, sigmaColor=75, sigmaSpace=75)


def adaptive_threshold(image: np.ndarray) -> np.ndarray:
    """Binarize with adaptive Gaussian thresholding for uneven lighting."""
    return cv2.adaptiveThreshold(
        image, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=11,
        C=2,
    )


def deskew(image: np.ndarray) -> np.ndarray:
    """
    Detect and correct small rotational skew (typically +/- 5 degrees).
    Leaves the image unchanged if no clear skew is detected.
    """
    coords = np.column_stack(np.where(image > 0))
    if len(coords) < 10:
        return image
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    if abs(angle) < 0.5:  # Ignore sub-half-degree skew — not worth resampling
        return image
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def preprocess(image: np.ndarray) -> np.ndarray:
    """
    Run the full preprocessing pipeline.
    Input:  BGR image array from cv2.imdecode()
    Output: Preprocessed grayscale array ready for OCR
    """
    gray = to_grayscale(image)
    denoised = denoise(gray)
    thresholded = adaptive_threshold(denoised)
    return deskew(thresholded)

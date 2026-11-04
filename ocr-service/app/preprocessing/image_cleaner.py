"""
image_cleaner.py - OpenCV image preprocessing pipeline

Applies a sequence of transformations to improve OCR accuracy on packaging labels:
  1. Convert to grayscale
  2. Contrast Limited Adaptive Histogram Equalization (CLAHE) for glare/shadows
  3. Bilateral filter (reduces noise while keeping text edges sharp)
  4. Deskew (detects and corrects small rotational tilts)
  5. Optional adaptive binarization

Stateless pure functions operating on numpy arrays.
"""

import cv2
import numpy as np


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """Converts a BGR image to grayscale if not already single-channel."""
    if len(image.shape) == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image


def apply_clahe(
    image: np.ndarray,
    clip_limit: float = 2.0,
    tile_grid_size: tuple[int, int] = (8, 8),
) -> np.ndarray:
    """
    Applies Contrast Limited Adaptive Histogram Equalization (CLAHE).
    Normalizes local illumination and enhances contrast on foil and glossy packs.
    """
    gray = to_grayscale(image)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    return clahe.apply(gray)


def denoise(image: np.ndarray) -> np.ndarray:
    """Bilateral filter — reduces noise while keeping text edges sharp."""
    return cv2.bilateralFilter(image, d=9, sigmaColor=75, sigmaSpace=75)


def adaptive_threshold(image: np.ndarray) -> np.ndarray:
    """Binarize with adaptive Gaussian thresholding for uneven lighting."""
    return cv2.adaptiveThreshold(
        image,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=11,
        C=2,
    )


def deskew(image: np.ndarray) -> np.ndarray:
    """
    Detect and correct rotational skew (typically +/- 5 degrees).
    Leaves the image unchanged if no clear skew is detected or skew is negligible.
    """
    gray = to_grayscale(image)
    coords = np.column_stack(np.where(gray > 0))
    if len(coords) < 10:
        return image

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    if abs(angle) < 0.5:  # Ignore sub-half-degree skew
        return image

    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    m = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(
        image,
        m,
        (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )


def preprocess(image: np.ndarray, binarize: bool = False) -> np.ndarray:
    """
    Runs the standard preprocessing pipeline for packaging OCR.

    Args:
        image: Input BGR numpy array from cv2.imdecode().
        binarize: If True, returns 1-bit adaptive thresholded image.
                 If False (default), returns contrast-enhanced CLAHE grayscale,
                 which preserves anti-aliased font strokes for deep learning OCR.

    Returns:
        Preprocessed image array.
    """
    gray = to_grayscale(image)
    enhanced = apply_clahe(gray, clip_limit=2.5)
    denoised = denoise(enhanced)
    deskewed = deskew(denoised)

    if binarize:
        return adaptive_threshold(deskewed)

    return deskewed

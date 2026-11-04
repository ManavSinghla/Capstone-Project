"""
test_preprocessing.py - Unit tests for image preprocessing and quality assessment

Tests blur calculation, glare estimation, CLAHE contrast enhancement,
deskewing, and adaptive binarization using synthetic OpenCV image buffers.
"""

import cv2
import numpy as np
from app.preprocessing.quality_checker import (
    compute_blur_score,
    compute_glare_percentage,
    assess_quality,
    BLUR_THRESHOLD,
)
from app.preprocessing.image_cleaner import (
    to_grayscale,
    apply_clahe,
    denoise,
    adaptive_threshold,
    deskew,
    preprocess,
)


def make_sharp_image() -> np.ndarray:
    """Creates a high-contrast synthetic image with sharp geometric edges."""
    img = np.zeros((200, 200, 3), dtype=np.uint8)
    # Add high-contrast white rectangles and text
    cv2.rectangle(img, (20, 20), (180, 80), (255, 255, 255), -1)
    cv2.putText(img, "TEST MRP", (30, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    return img


def make_blurry_image() -> np.ndarray:
    """Creates an intentionally blurred image using heavy Gaussian blur."""
    sharp = make_sharp_image()
    return cv2.GaussianBlur(sharp, (31, 31), 0)


def make_glare_image() -> np.ndarray:
    """Creates an image with high percentage of saturated white glare pixels."""
    img = np.full((100, 100, 3), 250, dtype=np.uint8)
    return img


def test_quality_checker_detects_sharp_vs_blurry():
    sharp = make_sharp_image()
    blurry = make_blurry_image()

    score_sharp = compute_blur_score(sharp)
    score_blurry = compute_blur_score(blurry)

    assert score_sharp > score_blurry
    assert score_sharp >= BLUR_THRESHOLD

    report_sharp = assess_quality(sharp)
    assert report_sharp["is_blurry"] is False

    report_blurry = assess_quality(blurry)
    assert report_blurry["is_blurry"] is True
    assert report_blurry["blur_score"] < BLUR_THRESHOLD


def test_quality_checker_detects_glare():
    glare = make_glare_image()
    pct = compute_glare_percentage(glare)
    assert pct >= 95.0

    dark = np.zeros((100, 100, 3), dtype=np.uint8)
    assert compute_glare_percentage(dark) == 0.0


def test_to_grayscale():
    bgr = np.zeros((50, 50, 3), dtype=np.uint8)
    gray = to_grayscale(bgr)
    assert len(gray.shape) == 2

    # Idempotent on already grayscale
    assert to_grayscale(gray).shape == (50, 50)


def test_clahe_enhances_contrast():
    gray = np.full((100, 100), 128, dtype=np.uint8)
    # Put low contrast gradient
    gray[20:80, 20:80] = 135
    clahe_out = apply_clahe(gray)
    assert clahe_out.shape == gray.shape
    # CLAHE spreads the histogram
    assert clahe_out.max() > 135 or clahe_out.min() < 128


def test_denoise_preserves_shape():
    img = make_sharp_image()
    gray = to_grayscale(img)
    denoised = denoise(gray)
    assert denoised.shape == gray.shape


def test_adaptive_threshold_binarizes():
    img = make_sharp_image()
    gray = to_grayscale(img)
    binarized = adaptive_threshold(gray)
    unique_vals = set(np.unique(binarized))
    # Binarized should only contain 0 and 255
    assert unique_vals.issubset({0, 255})


def test_preprocess_pipeline():
    img = make_sharp_image()

    # Default: contrast enhanced grayscale
    out_default = preprocess(img, binarize=False)
    assert len(out_default.shape) == 2
    assert out_default.shape[:2] == img.shape[:2]

    # Binarized option
    out_bin = preprocess(img, binarize=True)
    assert set(np.unique(out_bin)).issubset({0, 255})


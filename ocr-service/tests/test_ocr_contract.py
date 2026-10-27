"""
test_ocr_contract.py - Validates OCR HTTP contract using MockOCREngine

Ensures the /api/v1/ocr/process-image endpoint returns the schema
expected by the Express backend, without loading PaddleOCR weights.

Run: cd ocr-service && python -m pytest tests/ -v
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.engines.mock_engine import MockOCREngine


@pytest.fixture(autouse=True)
def inject_mock_engine():
    """Replace the real engine with the mock for all tests in this module."""
    app.state.ocr_engine = MockOCREngine()


@pytest.fixture
def client():
    return TestClient(app)


def make_fake_image_bytes():
    """Return minimal valid JPEG bytes for testing."""
    import numpy as np
    import cv2
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_process_image_returns_expected_schema(client):
    img_bytes = make_fake_image_bytes()
    resp = client.post(
        "/api/v1/ocr/process-image",
        files={"file": ("test.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        data={"panel_type": "PDP"},
    )
    assert resp.status_code == 200
    body = resp.json()

    assert body["success"] is True
    assert isinstance(body["processing_time_ms"], int)
    assert "image_metadata" in body
    assert "text_blocks" in body
    assert "full_extracted_text" in body

    meta = body["image_metadata"]
    assert "blur_score" in meta
    assert "is_blurry" in meta

    if body["text_blocks"]:
        block = body["text_blocks"][0]
        assert "text" in block
        assert "confidence" in block
        assert "bounding_box" in block
        bb = block["bounding_box"]
        for key in ("x_min", "y_min", "x_max", "y_max"):
            assert key in bb


def test_rejects_oversized_file(client):
    # Send more bytes than MAX_IMAGE_SIZE_MB (default 15MB)
    large = b"x" * (16 * 1024 * 1024)
    resp = client.post(
        "/api/v1/ocr/process-image",
        files={"file": ("big.jpg", io.BytesIO(large), "image/jpeg")},
        data={"panel_type": "PDP"},
    )
    assert resp.status_code == 413


def test_rejects_invalid_image_bytes(client):
    resp = client.post(
        "/api/v1/ocr/process-image",
        files={"file": ("bad.jpg", io.BytesIO(b"not-an-image"), "image/jpeg")},
        data={"panel_type": "PDP"},
    )
    assert resp.status_code == 422

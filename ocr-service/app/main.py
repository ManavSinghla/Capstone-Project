"""
main.py - FastAPI application entry point for the OCR service

Engine selection:
  - In production (OCR_USE_GPU=false/true): PaddleOCREngine
  - When OCR_USE_GPU is not set and paddlepaddle is not installed:
    falls back to MockOCREngine with a clear startup warning.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from .core.config import settings
from .core.exceptions import generic_exception_handler, validation_exception_handler
from .api.v1.ocr_router import router as ocr_router


def _load_engine():
    """
    Load the OCR engine at startup.
    Attempts PaddleOCR; falls back to mock with a warning if unavailable.
    """
    try:
        # Lazy import — only attempted if paddlepaddle is installed
        from .engines.paddle_engine import PaddleOCREngine  # noqa: PLC0415
        engine = PaddleOCREngine(use_gpu=settings.OCR_USE_GPU)
        print("[OCR] PaddleOCR engine loaded.")
        return engine
    except ImportError:
        from .engines.mock_engine import MockOCREngine  # noqa: PLC0415
        print("[OCR] WARNING: paddlepaddle not installed. Using MockOCREngine.")
        print("[OCR]          Install: pip install paddlepaddle")
        return MockOCREngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load engine once into app state
    app.state.ocr_engine = _load_engine()
    yield
    # Shutdown: nothing to clean up for a stateless engine


app = FastAPI(
    title="Legal Metrology OCR Service",
    description="Image preprocessing and text extraction for packaged commodity label compliance.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_exception_handler(ValueError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(ocr_router, prefix="/api/v1/ocr", tags=["OCR"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "legal-metrology-ocr"}

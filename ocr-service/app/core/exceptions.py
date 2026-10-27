"""
exceptions.py - Custom exception handlers for FastAPI
"""

from fastapi import Request
from fastapi.responses import JSONResponse


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": str(exc)},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "An unexpected OCR service error occurred."},
    )

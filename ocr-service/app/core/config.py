"""
config.py - OCR service configuration with validation

Reads environment variables and fails fast with clear messages
when required values are missing or invalid.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "info"
    MAX_IMAGE_SIZE_MB: int = 15
    OCR_USE_GPU: bool = False

    @property
    def max_image_size_bytes(self) -> int:
        return self.MAX_IMAGE_SIZE_MB * 1024 * 1024


settings = Settings()

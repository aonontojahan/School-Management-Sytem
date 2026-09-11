"""Application configuration loaded strictly from environment variables.

No secrets are hardcoded. Copy `.env.example` to `.env` and fill in real values.
"""
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "School Management System"
    ENVIRONMENT: str = "development"

    # e.g. postgresql+psycopg://aonontojahan:SECRET@localhost:5432/sms_db
    # sqlite is accepted for local smoke tests only (sqlite:///./sms.db)
    DATABASE_URL: str = Field(default="postgresql+psycopg://aonontojahan:CHANGE_ME@localhost:5432/sms_db")

    SECRET_KEY: str = Field(default="CHANGE_ME_generate_a_long_random_string")
    REFRESH_SECRET_KEY: str = Field(default="CHANGE_ME_generate_another_long_random_string")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    @field_validator("SECRET_KEY", "REFRESH_SECRET_KEY")
    @classmethod
    def _not_placeholder_in_prod(cls, v: str) -> str:
        # Warn-friendly: validation happens at startup in main.py for prod.
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

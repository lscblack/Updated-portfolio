"""Application settings — every value comes from the environment / .env file."""
from __future__ import annotations

import secrets
from functools import lru_cache
from typing import List
from urllib.parse import quote_plus, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── app ────────────────────────────────────────────────────────────────
    PROJECT_NAME: str = "Loue Sauveur Christian — Portfolio API"
    APP_ENV: str = "development"            # development | production
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173"
    MEDIA_BASE_URL: str = ""                # public base for /uploads (defaults to the API origin)
    FORCE_HTTPS: bool = False
    TRUSTED_HOSTS: str = ""                 # comma separated; empty = any host (nginx already filters)

    # ── database ───────────────────────────────────────────────────────────
    DATABASE_URL: str = ""
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_NAME: str = "lscblack_portfolio"
    REDIS_URL: str = ""

    # ── auth ───────────────────────────────────────────────────────────────
    JWT_SECRET: str = ""
    SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    LOGIN_MAX_FAILED: int = 6
    LOGIN_LOCK_MINUTES: int = 15

    DEFAULT_ADMIN_EMAIL: str = "admin@example.com"
    DEFAULT_ADMIN_PASSWORD: str = ""
    DEFAULT_ADMIN_NAME: str = "Administrator"

    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 5
    OTP_BYPASS_EMAIL: str = ""
    OTP_BYPASS_CODE: str = ""

    # ── email ──────────────────────────────────────────────────────────────
    EMAIL_ENABLED: bool = False
    EMAIL_SMTP_SERVER: str = ""
    EMAIL_SMTP_PORT: int = 587
    EMAIL_LOGIN: str = ""
    EMAIL_SENDER_EMAIL: str = ""
    EMAIL_SENDER_PASSWORD: str = ""
    EMAIL_SENDER_NAME: str = "Portfolio"
    CONTACT_NOTIFY_EMAIL: str = ""          # where contact-form notifications go (defaults to the admin email)

    # ── security extras ────────────────────────────────────────────────────
    DATA_ENCRYPTION_KEY: str = ""
    PAYLOAD_ENCRYPTION: bool = True
    RATE_LIMIT_AUTH: str = "10/60"
    RATE_LIMIT_GLOBAL: str = "300/60"
    CACHE_TTL_SECONDS: int = 120
    CAPTCHA_BYPASS_CODE: str = ""

    # ── uploads ────────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 30
    MAX_VIDEO_UPLOAD_MB: int = 80

    GITHUB_API_BASE: str = "https://api.github.com"
    GITHUB_USERNAME: str = "lscblack"

    # ── derived helpers ────────────────────────────────────────────────────
    @field_validator("APP_ENV")
    @classmethod
    def _env(cls, v: str) -> str:
        v = (v or "development").strip().lower()
        return "production" if v.startswith("prod") else "development"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def secret(self) -> str:
        """The signing secret. Generated per process in development when none is set."""
        s = self.JWT_SECRET or self.SECRET_KEY
        if not s or s == "change-this-secret":
            if self.is_production:
                raise RuntimeError("JWT_SECRET must be set to a long random value in production")
            s = _DEV_SECRET
        return s

    @property
    def data_key(self) -> str:
        return self.DATA_ENCRYPTION_KEY or self.secret

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def trusted_hosts(self) -> List[str]:
        return [h.strip() for h in self.TRUSTED_HOSTS.split(",") if h.strip()]

    @property
    def otp_bypass_emails(self) -> List[str]:
        return [e.strip().lower() for e in self.OTP_BYPASS_EMAIL.split(",") if e.strip()]

    @property
    def captcha_bypass(self) -> str:
        return "" if self.is_production else self.CAPTCHA_BYPASS_CODE

    def _rate(self, raw: str, default: tuple[int, int]) -> tuple[int, int]:
        try:
            n, s = raw.split("/")
            return max(1, int(n)), max(1, int(s))
        except Exception:
            return default

    @property
    def rate_auth(self) -> tuple[int, int]:
        return self._rate(self.RATE_LIMIT_AUTH, (10, 60))

    @property
    def rate_global(self) -> tuple[int, int]:
        return self._rate(self.RATE_LIMIT_GLOBAL, (300, 60))

    @property
    def database_url(self) -> str:
        """Full PostgreSQL SQLAlchemy URL. DATABASE_URL may omit the database name; DB_* fill the gaps."""
        url = (self.DATABASE_URL or "").strip()
        if url.startswith("sqlite"):
            raise RuntimeError(
                "SQLite is not supported — this application requires PostgreSQL. "
                "Set DB_HOST/DB_USER/DB_PASSWORD/DB_NAME (or a postgresql:// DATABASE_URL) in the .env file."
            )
        if not url:
            url = f"postgresql+psycopg://{quote_plus(self.DB_USER)}:{quote_plus(self.DB_PASSWORD)}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        if url.startswith("postgres://"):
            url = "postgresql+psycopg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://"):
            url = "postgresql+psycopg://" + url[len("postgresql://"):]
        if not url.startswith("postgresql"):
            raise RuntimeError(f"unsupported DATABASE_URL scheme in {url.split('://')[0]}:// — only PostgreSQL is supported")
        parts = urlsplit(url)
        path = parts.path.strip("/")
        if not path:
            parts = parts._replace(path="/" + self.DB_NAME)
        return urlunsplit(parts)

    @property
    def db_name(self) -> str:
        return urlsplit(self.database_url).path.strip("/") or self.DB_NAME

    @property
    def admin_db_url(self) -> str:
        """Same server, maintenance database — used to create the app database."""
        return urlunsplit(urlsplit(self.database_url)._replace(path="/postgres"))


_DEV_SECRET = secrets.token_urlsafe(48)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

"""FastAPI application factory."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .api import auth, contact, content, projects, uploads
from .core.config import settings
from .core.middleware import GlobalRateLimitMiddleware, HTTPSRedirectMiddleware, PayloadEnvelopeMiddleware, SecurityHeadersMiddleware
from .db.session import ensure_database, init_db
from .seed import seed

logging.basicConfig(level=logging.DEBUG if settings.DEBUG else logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("portfolio")


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_database()
    init_db()
    seed()
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    log.info("%s ready (%s) — db=%s", settings.PROJECT_NAME, settings.APP_ENV, settings.db_name)
    yield


def create_app() -> FastAPI:
    docs = None if settings.is_production else "/docs"
    app = FastAPI(title=settings.PROJECT_NAME, version="2.0.0", lifespan=lifespan, docs_url=docs, redoc_url=None, openapi_url=None if settings.is_production else "/openapi.json")

    # middleware (last added = outermost)
    app.add_middleware(PayloadEnvelopeMiddleware)
    app.add_middleware(GlobalRateLimitMiddleware)
    app.add_middleware(
        CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=False,
        allow_methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Payload-Encryption", "X-Payload-Key", "X-Requested-With"],
        expose_headers=["X-Payload-Encryption", "Retry-After"], max_age=600,
    )
    if settings.trusted_hosts:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)

    app.include_router(contact.router, prefix="/api/public", tags=["public"])
    app.include_router(auth.router, prefix="/api/admin/auth", tags=["admin: auth"])
    app.include_router(content.router, prefix="/api/admin", tags=["admin: content"])
    app.include_router(uploads.router, prefix="/api/admin/uploads", tags=["admin: uploads"])
    app.include_router(projects.router, prefix="/api/admin", tags=["admin: github"])

    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        msgs = [f"{'.'.join(str(x) for x in e['loc'] if x != 'body')}: {e['msg']}" for e in exc.errors()]
        return JSONResponse({"detail": "; ".join(msgs) or "Invalid request"}, status_code=422)

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception):
        log.exception("Unhandled error: %s", exc)
        return JSONResponse({"detail": "Internal server error"}, status_code=500)

    @app.get("/", include_in_schema=False)
    def root():
        return {"service": settings.PROJECT_NAME, "status": "ok", "docs": docs}

    return app


app = create_app()

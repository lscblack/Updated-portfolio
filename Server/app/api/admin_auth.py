"""Shared dependencies: current admin, client identity, per-route rate limits and audit logging."""
from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from ..core.config import settings
from ..core.security import decode_token, hash_ip
from ..core.store import rate_hit
from ..db.session import get_session
from ..models import AdminUser, AuditLog

bearer = HTTPBearer(auto_error=False)


def client_ip(request: Request) -> str:
    # uvicorn/gunicorn rewrite request.client from X-Forwarded-For when started with proxy headers enabled
    ip = request.client.host if request.client else "0.0.0.0"
    xff = request.headers.get("x-real-ip")
    if xff and ip in ("127.0.0.1", "::1"):
        ip = xff.strip()
    return ip


def rate_limited(bucket: str, limit: Optional[int] = None, window: Optional[int] = None):
    """Dependency factory: `Depends(rate_limited("login"))` — per-IP sliding window."""
    lim, win = (limit, window) if limit and window else settings.rate_auth

    def dep(request: Request):
        allowed, _ = rate_hit(f"{bucket}:{client_ip(request)}", lim, win)
        if not allowed:
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests — slow down and try again shortly",
                                headers={"Retry-After": str(win)})
    return dep


def get_current_admin(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    session: Session = Depends(get_session),
) -> AdminUser:
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated", headers={"WWW-Authenticate": "Bearer"})
    payload = decode_token(creds.credentials)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session", headers={"WWW-Authenticate": "Bearer"})
    admin = session.get(AdminUser, int(payload["sub"]))
    if not admin or not admin.is_active or admin.token_version != payload.get("ver"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session revoked — sign in again", headers={"WWW-Authenticate": "Bearer"})
    request.state.admin = admin
    return admin


def audit(session: Session, request: Request, admin: Optional[AdminUser], action: str, target: str = "", detail: Optional[dict] = None) -> None:
    session.add(AuditLog(admin_id=admin.id if admin else None, action=action, target=target[:160], detail=detail, ip_hash=hash_ip(client_ip(request))))

"""Administrator sign-in: password → one-time code (email) → bearer token."""
from __future__ import annotations

import logging
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from ..core.config import settings
from ..core.mailer import send_otp_email
from ..core.security import (
    constant_eq, create_access_token, generate_otp, hash_code, hash_ip, hash_password,
    needs_rehash, password_strength_error, verify_password,
)
from ..db.session import get_session
from ..models import AdminUser, LoginChallenge
from ..schemas import CredentialsUpdate, LoginRequest, LoginStarted, TokenResponse, VerifyRequest
from .admin_auth import audit, client_ip, get_current_admin, rate_limited

log = logging.getLogger(__name__)
router = APIRouter()

_GENERIC = "Invalid email or password"


def _mask(email: str) -> str:
    user, _, domain = email.partition("@")
    if len(user) <= 2:
        return f"{user[0]}***@{domain}"
    return f"{user[0]}{'*' * min(6, len(user) - 2)}{user[-1]}@{domain}"


def _admin_public(a: AdminUser) -> dict:
    return {"id": a.id, "email": a.email, "name": a.name, "last_login_at": a.last_login_at.isoformat() if a.last_login_at else None}


@router.post("/login", response_model=LoginStarted, dependencies=[Depends(rate_limited("login"))])
def login(body: LoginRequest, request: Request, tasks: BackgroundTasks, session: Session = Depends(get_session)):
    email = body.email.lower().strip()
    admin = session.exec(select(AdminUser).where(AdminUser.email == email)).first()
    now = datetime.utcnow()

    if admin and admin.locked_until and admin.locked_until > now:
        wait = int((admin.locked_until - now).total_seconds() // 60) + 1
        raise HTTPException(status.HTTP_423_LOCKED, f"Account temporarily locked. Try again in {wait} minute(s).")

    if not admin or not admin.is_active or not verify_password(body.password, admin.password_hash):
        if admin:
            admin.failed_attempts += 1
            if admin.failed_attempts >= settings.LOGIN_MAX_FAILED:
                admin.locked_until = now + timedelta(minutes=settings.LOGIN_LOCK_MINUTES)
                admin.failed_attempts = 0
                audit(session, request, admin, "login.locked")
            session.add(admin)
            session.commit()
        else:
            # burn similar time for unknown accounts so timing does not leak existence
            verify_password(body.password, "$argon2id$v=19$m=65536,t=3,p=2$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, _GENERIC)

    if needs_rehash(admin.password_hash):
        admin.password_hash = hash_password(body.password)
    admin.failed_attempts = 0
    admin.locked_until = None

    # second factor
    code = generate_otp()
    challenge_id = secrets.token_urlsafe(24)
    session.add(LoginChallenge(
        id=challenge_id, admin_id=admin.id, code_hash=hash_code(code, challenge_id),
        ip_hash=hash_ip(client_ip(request)),
        expires_at=datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
    ))
    audit(session, request, admin, "login.password_ok")
    session.add(admin)
    session.commit()

    delivery = "email"
    if settings.EMAIL_ENABLED and settings.EMAIL_SMTP_SERVER:
        tasks.add_task(send_otp_email, admin.email, admin.name, code, settings.OTP_EXPIRE_MINUTES, client_ip(request))
    else:
        delivery = "console"
        log.warning("OTP for %s: %s (email disabled)", admin.email, code)
    if settings.OTP_BYPASS_CODE and admin.email in settings.otp_bypass_emails:
        delivery = "bypass" if delivery == "console" else "email"
    return LoginStarted(challenge_id=challenge_id, delivery=delivery, expires_in=settings.OTP_EXPIRE_MINUTES * 60, masked_email=_mask(admin.email))


@router.post("/verify", response_model=TokenResponse, dependencies=[Depends(rate_limited("verify"))])
def verify(body: VerifyRequest, request: Request, session: Session = Depends(get_session)):
    ch = session.get(LoginChallenge, body.challenge_id)
    now = datetime.utcnow()
    if not ch or ch.consumed or ch.expires_at < now:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This sign-in attempt has expired. Start again.")
    admin = session.get(AdminUser, ch.admin_id)
    if not admin or not admin.is_active:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This sign-in attempt is no longer valid.")
    if ch.attempts >= settings.OTP_MAX_ATTEMPTS:
        ch.consumed = True
        session.add(ch); session.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Too many wrong codes. Start again.")

    ok = constant_eq(ch.code_hash, hash_code(body.code, ch.id))
    if not ok and settings.OTP_BYPASS_CODE and admin.email in settings.otp_bypass_emails:
        ok = constant_eq(body.code, settings.OTP_BYPASS_CODE)
    if not ok:
        ch.attempts += 1
        session.add(ch); session.commit()
        left = settings.OTP_MAX_ATTEMPTS - ch.attempts
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Incorrect code. {left} attempt(s) left.")

    ch.consumed = True
    admin.last_login_at = now
    admin.last_login_ip = hash_ip(client_ip(request))[:16]
    token, exp = create_access_token(admin.id, admin.token_version)
    audit(session, request, admin, "login.success")
    # tidy old challenges for this admin
    for old in session.exec(select(LoginChallenge).where(LoginChallenge.admin_id == admin.id, LoginChallenge.expires_at < now)).all():
        session.delete(old)
    session.add(ch); session.add(admin); session.commit(); session.refresh(admin)
    return TokenResponse(access_token=token, expires_at=exp.isoformat(), admin=_admin_public(admin))


@router.get("/me")
def me(admin: AdminUser = Depends(get_current_admin)):
    return _admin_public(admin)


@router.post("/logout")
def logout(request: Request, admin: AdminUser = Depends(get_current_admin), session: Session = Depends(get_session)):
    audit(session, request, admin, "logout"); session.commit()
    return {"ok": True}


@router.post("/logout-all")
def logout_everywhere(request: Request, admin: AdminUser = Depends(get_current_admin), session: Session = Depends(get_session)):
    """Revoke every issued token (including this one)."""
    admin.token_version += 1
    audit(session, request, admin, "logout.all")
    session.add(admin); session.commit()
    return {"ok": True}


@router.patch("/credentials", response_model=TokenResponse, dependencies=[Depends(rate_limited("credentials"))])
def update_credentials(body: CredentialsUpdate, request: Request, admin: AdminUser = Depends(get_current_admin), session: Session = Depends(get_session)):
    if not verify_password(body.current_password, admin.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    changed = []
    if body.new_password:
        err = password_strength_error(body.new_password)
        if err:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, err)
        admin.password_hash = hash_password(body.new_password)
        admin.token_version += 1          # every other session must sign in again
        changed.append("password")
    if body.new_email and body.new_email.lower() != admin.email:
        new_email = body.new_email.lower().strip()
        if session.exec(select(AdminUser).where(AdminUser.email == new_email)).first():
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "That email is already in use")
        admin.email = new_email
        changed.append("email")
    if body.new_name and body.new_name.strip():
        admin.name = body.new_name.strip()
        changed.append("name")
    if not changed:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nothing to change")
    audit(session, request, admin, "credentials.updated", detail={"fields": changed})
    session.add(admin); session.commit(); session.refresh(admin)
    token, exp = create_access_token(admin.id, admin.token_version)
    return TokenResponse(access_token=token, expires_at=exp.isoformat(), admin=_admin_public(admin))

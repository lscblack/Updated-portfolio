from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlmodel import Session

from ..db.session import engine
from ..core.config import settings
from ..models.admin import AdminCredentials

router = APIRouter()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)

_DEFAULT_PASSWORD = "Chriss@123"


def _get_or_create_admin(session: Session) -> AdminCredentials:
    admin = session.get(AdminCredentials, 1)
    if not admin:
        admin = AdminCredentials(hashed_password=pwd.hash(_DEFAULT_PASSWORD))
        session.add(admin)
        session.commit()
        session.refresh(admin)
    elif not admin.hashed_password:
        admin.hashed_password = pwd.hash(_DEFAULT_PASSWORD)
        session.add(admin)
        session.commit()
        session.refresh(admin)
    return admin


def _make_token(username: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": username, "exp": exp}, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def require_admin(creds: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if not payload.get("sub"):
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload["sub"]


class LoginRequest(BaseModel):
    username: str
    password: str


class UpdateCredentials(BaseModel):
    new_username: str | None = None
    new_password: str | None = None
    current_password: str


@router.post("/admin/login")
def admin_login(body: LoginRequest):
    with Session(engine) as s:
        admin = _get_or_create_admin(s)
        if body.username != admin.username or not pwd.verify(body.password, admin.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
        return {"access_token": _make_token(admin.username), "token_type": "bearer"}


@router.get("/admin/me")
def admin_me(username: str = Depends(require_admin)):
    with Session(engine) as s:
        admin = s.get(AdminCredentials, 1)
        return {"username": admin.username if admin else "lscblack"}


@router.patch("/admin/credentials")
def update_credentials(body: UpdateCredentials, _: str = Depends(require_admin)):
    with Session(engine) as s:
        admin = _get_or_create_admin(s)
        if not pwd.verify(body.current_password, admin.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        if body.new_username:
            admin.username = body.new_username
        if body.new_password:
            admin.hashed_password = pwd.hash(body.new_password)
        s.add(admin)
        s.commit()
        return {"ok": True, "username": admin.username}

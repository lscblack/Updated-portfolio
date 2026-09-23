"""Dashboard administrator account."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class AdminUser(SQLModel, table=True):
    __tablename__ = "admin_user"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=255)
    name: str = Field(default="Administrator", max_length=120)
    password_hash: str = Field(default="", max_length=512)
    token_version: int = Field(default=1)          # bump to revoke every issued token
    failed_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    last_login_ip: Optional[str] = Field(default=None, max_length=64)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

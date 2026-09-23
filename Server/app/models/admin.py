"""Auth challenges, audit trail and uploaded media."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, JSON, Text
from sqlmodel import Field, SQLModel


class LoginChallenge(SQLModel, table=True):
    """Second factor of the sign-in flow: a hashed one-time code tied to an admin + client."""
    __tablename__ = "login_challenge"

    id: str = Field(primary_key=True, max_length=64)
    admin_id: int = Field(index=True)
    code_hash: str = Field(max_length=128)
    attempts: int = Field(default=0)
    consumed: bool = Field(default=False)
    ip_hash: str = Field(default="", max_length=64)
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    admin_id: Optional[int] = Field(default=None, index=True)
    action: str = Field(max_length=64)
    target: str = Field(default="", max_length=160)
    detail: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    ip_hash: str = Field(default="", max_length=64)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Upload(SQLModel, table=True):
    __tablename__ = "upload"

    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str = Field(max_length=255)          # stored name (random)
    original_name: str = Field(default="", max_length=255)
    content_type: str = Field(default="", max_length=120)
    size: int = Field(default=0)
    width: Optional[int] = None
    height: Optional[int] = None
    kind: str = Field(default="image", max_length=32)
    url: str = Field(default="", sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow)

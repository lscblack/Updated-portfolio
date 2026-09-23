"""Self-hosted, privacy-respecting visit analytics.

No cookies and no raw IP addresses: the browser keeps a random device id in localStorage and the server
stores only a keyed hash of it, so visits can be counted per device without identifying anyone.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel

from .base import utcnow


class Visit(SQLModel, table=True):
    __tablename__ = "visit"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True, unique=True, max_length=64)
    visitor_hash: str = Field(index=True, max_length=64)   # hashed device id — unique-device counting

    entry_path: str = Field(default="/", max_length=200)
    referrer: str = Field(default="", max_length=300)
    device: str = Field(default="desktop", max_length=16)  # desktop | mobile | tablet
    browser: str = Field(default="", max_length=40)
    os: str = Field(default="", max_length=40)
    screen: str = Field(default="", max_length=24)
    timezone: str = Field(default="", max_length=64)
    language: str = Field(default="", max_length=16)
    country: str = Field(default="", max_length=8)         # only when the proxy provides it

    duration_seconds: int = Field(default=0)
    interactions: int = Field(default=0)                   # clicks, key presses and taps
    max_scroll: int = Field(default=0)                     # furthest scroll depth, percent
    sections: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    pages: int = Field(default=1)

    started_at: datetime = Field(default_factory=utcnow, index=True)
    last_seen_at: datetime = Field(default_factory=utcnow)

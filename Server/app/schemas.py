"""Request/response shapes for auth and the public contact form."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class LoginStarted(BaseModel):
    challenge_id: str
    delivery: str                 # "email" | "bypass" | "console"
    expires_in: int
    masked_email: str


class VerifyRequest(BaseModel):
    challenge_id: str = Field(min_length=8, max_length=64)
    code: str = Field(min_length=4, max_length=10)

    @field_validator("code")
    @classmethod
    def _digits(cls, v: str) -> str:
        v = v.strip().replace(" ", "")
        if not v.isdigit():
            raise ValueError("Code must be numeric")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: str
    admin: dict


class CredentialsUpdate(BaseModel):
    current_password: str = Field(min_length=1, max_length=256)
    new_email: Optional[EmailStr] = None
    new_name: Optional[str] = Field(default=None, max_length=120)
    new_password: Optional[str] = Field(default=None, max_length=256)


OFFER_KINDS = ("job", "contract", "freelance", "research", "collaboration", "other")


class OfferIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: str = Field(default="", max_length=160)
    website: str = Field(default="", max_length=300)
    kind: str = Field(default="job", max_length=32)
    title: str = Field(min_length=3, max_length=200)
    budget: str = Field(default="", max_length=64)
    timeline: str = Field(default="", max_length=64)
    message: str = Field(min_length=10, max_length=6000)
    captcha_id: str = Field(default="", max_length=64)
    captcha_answer: str = Field(default="", max_length=32)
    honeypot: str = Field(default="", max_length=200)

    @field_validator("kind")
    @classmethod
    def _kind(cls, v: str) -> str:
        return v if v in OFFER_KINDS else "other"


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    captcha_id: str = Field(default="", max_length=64)
    captcha_answer: str = Field(default="", max_length=32)
    website: str = Field(default="", max_length=200)     # honeypot — must stay empty

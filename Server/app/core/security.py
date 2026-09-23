"""Password hashing, JWT, one-time codes, at-rest encryption and the payload envelope key."""
from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from jose import jwt, JWTError

from .config import settings

_ph = PasswordHasher(time_cost=3, memory_cost=64 * 1024, parallelism=2)


# ── passwords ──────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    if not hashed:
        return False
    try:
        return _ph.verify(hashed, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(hashed: str) -> bool:
    try:
        return _ph.check_needs_rehash(hashed)
    except Exception:
        return False


def password_strength_error(password: str) -> Optional[str]:
    if len(password) < 10:
        return "Password must be at least 10 characters"
    classes = sum([
        any(c.islower() for c in password), any(c.isupper() for c in password),
        any(c.isdigit() for c in password), any(not c.isalnum() for c in password),
    ])
    if classes < 3:
        return "Use at least three of: lowercase, uppercase, digits, symbols"
    return None


# ── tokens ─────────────────────────────────────────────────────────────────
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def as_aware(dt: Optional[datetime]) -> Optional[datetime]:
    """Treat a value read from the database as UTC when the column has no timezone.

    Databases created before timestamps became timezone-aware store naive values; comparing
    those with an aware `now_utc()` would raise TypeError.
    """
    if dt is None or dt.tzinfo is not None:
        return dt
    return dt.replace(tzinfo=timezone.utc)


def create_access_token(admin_id: int, token_version: int, minutes: Optional[int] = None) -> tuple[str, datetime]:
    exp = now_utc() + timedelta(minutes=minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(admin_id), "ver": token_version, "typ": "access",
        "jti": secrets.token_urlsafe(12), "iat": int(now_utc().timestamp()), "exp": exp,
    }
    return jwt.encode(payload, settings.secret, algorithm=settings.JWT_ALGORITHM), exp


def decode_token(token: str) -> Optional[dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.secret, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
    if payload.get("typ") != "access" or not payload.get("sub"):
        return None
    return payload


# ── one-time codes ─────────────────────────────────────────────────────────
def generate_otp(length: Optional[int] = None) -> str:
    n = max(4, min(10, length or settings.OTP_LENGTH))
    return "".join(secrets.choice(string.digits) for _ in range(n))


def hash_code(code: str, salt: str) -> str:
    return hmac.new(settings.secret.encode(), f"{salt}:{code}".encode(), hashlib.sha256).hexdigest()


def constant_eq(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode(), b.encode())


def hash_ip(ip: str) -> str:
    return hashlib.sha256(f"{settings.data_key}:{ip}".encode()).hexdigest()[:32]


# ── at-rest encryption (contact messages) ──────────────────────────────────
def _fernet() -> Fernet:
    key = hashlib.sha256(settings.data_key.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key))


def encrypt_text(plain: str) -> str:
    if plain is None:
        return ""
    return "enc:" + _fernet().encrypt(plain.encode()).decode()


def decrypt_text(value: str) -> str:
    if not value:
        return ""
    if not value.startswith("enc:"):
        return value
    try:
        return _fernet().decrypt(value[4:].encode()).decode()
    except InvalidToken:
        return "[unreadable — encryption key changed]"


# ── payload envelope (ECDH P-256 + HKDF + AES-256-GCM) ─────────────────────
_INFO = b"lscblack-portfolio-payload-v1"


def server_private_key() -> ec.EllipticCurvePrivateKey:
    """Deterministic P-256 key derived from the secret, so every worker shares it."""
    seed = HKDF(algorithm=hashes.SHA256(), length=32, salt=b"payload-key", info=_INFO).derive(settings.secret.encode())
    order = ec.SECP256R1().key_size  # 256
    value = int.from_bytes(seed, "big") % (2 ** order - 1)
    return ec.derive_private_key(max(value, 1), ec.SECP256R1())


def server_public_key_spki_b64() -> str:
    pub = server_private_key().public_key().public_bytes(
        serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    return base64.b64encode(pub).decode()


def server_key_id() -> str:
    return hashlib.sha256(server_public_key_spki_b64().encode()).hexdigest()[:12]


def derive_shared_key(client_spki_b64: str) -> bytes:
    peer = serialization.load_der_public_key(base64.b64decode(client_spki_b64))
    if not isinstance(peer, ec.EllipticCurvePublicKey):
        raise ValueError("invalid client key")
    shared = server_private_key().exchange(ec.ECDH(), peer)
    return HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=_INFO).derive(shared)

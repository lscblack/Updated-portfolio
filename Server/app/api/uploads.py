"""Image uploads for avatars, project covers and logos. Files are validated with Pillow and renamed."""
from __future__ import annotations

import os
import secrets
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from PIL import Image, UnidentifiedImageError
from sqlmodel import Session, select

from ..core.config import settings
from ..db.session import get_session
from ..models import AdminUser, Upload
from .admin_auth import audit, get_current_admin

router = APIRouter(dependencies=[Depends(get_current_admin)])

ALLOWED = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp", "GIF": "gif"}
MAX_DIM = 3200


def upload_dir() -> Path:
    p = Path(settings.UPLOAD_DIR)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _public_url(request: Request, filename: str) -> str:
    base = settings.MEDIA_BASE_URL.rstrip("/") if settings.MEDIA_BASE_URL else str(request.base_url).rstrip("/")
    return f"{base}/uploads/{filename}"


@router.post("", status_code=201)
async def upload_image(request: Request, file: UploadFile = File(...), session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    raw = await file.read()
    limit = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(raw) > limit:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, f"File exceeds {settings.MAX_UPLOAD_MB} MB")
    if raw[:5] == b"%PDF-":
        name = f"{secrets.token_urlsafe(12)}.pdf"
        path = upload_dir() / name
        path.write_bytes(raw); os.chmod(path, 0o644)
        row = Upload(filename=name, original_name=(file.filename or "document.pdf")[:255], content_type="application/pdf",
                     size=len(raw), kind="document", url=_public_url(request, name))
        session.add(row); session.flush()
        audit(session, request, admin, "upload.create", target=name)
        session.commit(); session.refresh(row)
        return row
    try:
        img = Image.open(BytesIO(raw))
        img.verify()
        img = Image.open(BytesIO(raw))
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only JPEG, PNG, WebP, GIF images or PDF documents are accepted")
    fmt = (img.format or "").upper()
    if fmt not in ALLOWED:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only JPEG, PNG, WebP or GIF images are accepted")
    ext = ALLOWED[fmt]
    name = f"{secrets.token_urlsafe(12)}.{ext}"
    path = upload_dir() / name

    # re-encode (strips metadata / embedded payloads); GIFs are stored as-is to keep animation
    if fmt == "GIF":
        path.write_bytes(raw)
        width, height = img.size
    else:
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if fmt in ("PNG", "WEBP") else "RGB")
        if max(img.size) > MAX_DIM:
            img.thumbnail((MAX_DIM, MAX_DIM))
        save_kwargs = {"quality": 88, "optimize": True} if fmt in ("JPEG", "WEBP") else {"optimize": True}
        img.save(path, format=fmt, **save_kwargs)
        width, height = img.size
    os.chmod(path, 0o644)

    row = Upload(filename=name, original_name=(file.filename or "")[:255], content_type=f"image/{ext if ext != 'jpg' else 'jpeg'}",
                 size=path.stat().st_size, width=width, height=height, url=_public_url(request, name))
    session.add(row); session.flush()
    audit(session, request, admin, "upload.create", target=name)
    session.commit(); session.refresh(row)
    return row


@router.get("")
def list_uploads(session: Session = Depends(get_session)):
    return session.exec(select(Upload).order_by(Upload.created_at.desc())).all()


@router.delete("/{upload_id}")
def delete_upload(upload_id: int, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    row = session.get(Upload, upload_id)
    if not row:
        raise HTTPException(404, "Not found")
    path = upload_dir() / Path(row.filename).name
    if path.exists():
        path.unlink()
    session.delete(row)
    audit(session, request, admin, "upload.delete", target=row.filename)
    session.commit()
    return {"ok": True}

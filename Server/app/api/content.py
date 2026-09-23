"""Authenticated dashboard API: every section is editable here. Generic collections share one code path."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from pydantic import ValidationError
from sqlmodel import Session, func, select

from ..core.mailer import send_offer_status
from ..core.security import decrypt_text, encrypt_text, now_utc
from ..core.store import cache_clear
from ..db.session import get_session
from ..models import (
    AboutBase, AboutContent, ActivityBase, ActivityItem, AdminUser, AuditLog, Certification,
    CertificationBase, ContactMessage, EducationBase, EducationItem, ExperienceBase, ExperienceItem,
    InterestBase, InterestItem, JourneyBase, JourneyMilestone, Notification, Offer, Project, ProjectBase, SiteSettings,
    SiteSettingsBase, SkillCategory, SkillCategoryBase, Upload,
)
from .admin_auth import audit, get_current_admin
from .contact import SITE_CACHE_KEY

router = APIRouter(dependencies=[Depends(get_current_admin)])

COLLECTIONS: dict[str, tuple[type, type]] = {
    "journey": (JourneyBase, JourneyMilestone),
    "experience": (ExperienceBase, ExperienceItem),
    "skills": (SkillCategoryBase, SkillCategory),
    "projects": (ProjectBase, Project),
    "education": (EducationBase, EducationItem),
    "certifications": (CertificationBase, Certification),
    "activities": (ActivityBase, ActivityItem),
    "interests": (InterestBase, InterestItem),
}


def _invalidate():
    cache_clear(SITE_CACHE_KEY)


def _collection(name: str):
    if name not in COLLECTIONS:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Unknown collection '{name}'")
    return COLLECTIONS[name]


def _validate(base: type, payload: dict) -> dict:
    try:
        return base.model_validate(payload).model_dump()
    except ValidationError as e:
        errors = "; ".join(f"{'.'.join(str(x) for x in err['loc'])}: {err['msg']}" for err in e.errors())
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, errors)


# ── dashboard overview ─────────────────────────────────────────────────────
@router.get("/overview")
def overview(session: Session = Depends(get_session)):
    counts = {name: session.exec(select(func.count()).select_from(model)).one() for name, (_, model) in COLLECTIONS.items()}
    unread = session.exec(select(func.count()).select_from(ContactMessage).where(ContactMessage.read == False)).one()  # noqa: E712
    total_msgs = session.exec(select(func.count()).select_from(ContactMessage)).one()
    offers_new = session.exec(select(func.count()).select_from(Offer).where(Offer.status == "new")).one()
    offers_total = session.exec(select(func.count()).select_from(Offer)).one()
    recent = session.exec(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(8)).all()
    settings_row = session.get(SiteSettings, 1)
    return {
        "counts": counts, "messages": {"unread": unread, "total": total_msgs}, "offers": {"new": offers_new, "total": offers_total},
        "uploads": session.exec(select(func.count()).select_from(Upload)).one(),
        "settings_updated_at": settings_row.updated_at.isoformat() if settings_row else None,
        "recent_activity": [r.model_dump() for r in recent],
    }


# ── singletons ─────────────────────────────────────────────────────────────
@router.get("/settings")
def get_settings_row(session: Session = Depends(get_session)):
    row = session.get(SiteSettings, 1)
    if not row:
        raise HTTPException(404, "Settings not initialised")
    return row


@router.patch("/settings")
def patch_settings(payload: dict, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    row = session.get(SiteSettings, 1) or SiteSettings(id=1)
    merged = {**row.model_dump(exclude={"id", "updated_at"}), **{k: v for k, v in payload.items() if k in SiteSettingsBase.model_fields}}
    data = _validate(SiteSettingsBase, merged)
    for k, v in data.items():
        setattr(row, k, v)
    row.updated_at = now_utc()
    audit(session, request, admin, "settings.update", detail={"fields": sorted(k for k in payload if k in SiteSettingsBase.model_fields)})
    session.add(row); session.commit(); session.refresh(row); _invalidate()
    return row


@router.get("/about")
def get_about(session: Session = Depends(get_session)):
    return session.get(AboutContent, 1) or AboutContent(id=1)


@router.patch("/about")
def patch_about(payload: dict, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    row = session.get(AboutContent, 1) or AboutContent(id=1)
    merged = {**row.model_dump(exclude={"id"}), **{k: v for k, v in payload.items() if k in AboutBase.model_fields}}
    data = _validate(AboutBase, merged)
    for k, v in data.items():
        setattr(row, k, v)
    audit(session, request, admin, "about.update")
    session.add(row); session.commit(); session.refresh(row); _invalidate()
    return row


# ── generic collections ────────────────────────────────────────────────────
@router.get("/collections")
def list_collections():
    return {name: list(base.model_fields.keys()) for name, (base, _) in COLLECTIONS.items()}


@router.get("/c/{name}")
def list_items(name: str, session: Session = Depends(get_session)):
    _, model = _collection(name)
    return session.exec(select(model).order_by(model.order, model.id)).all()


@router.post("/c/{name}", status_code=201)
def create_item(name: str, payload: dict, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    base, model = _collection(name)
    data = _validate(base, payload)
    if not payload.get("order"):
        data["order"] = (session.exec(select(func.max(model.order))).one() or 0) + 1
    row = model(**data)
    session.add(row); session.flush()
    audit(session, request, admin, f"{name}.create", target=str(row.id))
    session.commit(); session.refresh(row); _invalidate()
    return row


@router.put("/c/{name}/{item_id}")
def update_item(name: str, item_id: int, payload: dict, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    base, model = _collection(name)
    row = session.get(model, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    merged = {**row.model_dump(exclude={"id"}), **{k: v for k, v in payload.items() if k in base.model_fields}}
    data = _validate(base, merged)
    for k, v in data.items():
        setattr(row, k, v)
    audit(session, request, admin, f"{name}.update", target=str(item_id))
    session.add(row); session.commit(); session.refresh(row); _invalidate()
    return row


@router.delete("/c/{name}/{item_id}")
def delete_item(name: str, item_id: int, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    _, model = _collection(name)
    row = session.get(model, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    session.delete(row)
    audit(session, request, admin, f"{name}.delete", target=str(item_id), detail={"title": getattr(row, "title", getattr(row, "name", getattr(row, "label", "")))})
    session.commit(); _invalidate()
    return {"ok": True}


@router.post("/c/{name}/reorder")
def reorder(name: str, ids: list[int], request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    _, model = _collection(name)
    rows = {r.id: r for r in session.exec(select(model).where(model.id.in_(ids))).all()}
    for i, rid in enumerate(ids):
        if rid in rows:
            rows[rid].order = i
            session.add(rows[rid])
    audit(session, request, admin, f"{name}.reorder")
    session.commit(); _invalidate()
    return {"ok": True}


# ── inbox ──────────────────────────────────────────────────────────────────
def _msg_out(m: ContactMessage) -> dict:
    d = m.model_dump(exclude={"ip_hash"})
    d["message"] = decrypt_text(m.message)
    return d


@router.get("/messages")
def list_messages(unread: Optional[bool] = None, q: str = Query("", max_length=100), limit: int = Query(50, le=200), offset: int = 0, session: Session = Depends(get_session)):
    stmt = select(ContactMessage)
    if unread is not None:
        stmt = stmt.where(ContactMessage.read == (not unread))
    if q:
        like = f"%{q}%"
        stmt = stmt.where((ContactMessage.name.ilike(like)) | (ContactMessage.email.ilike(like)) | (ContactMessage.subject.ilike(like)))
    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    rows = session.exec(stmt.order_by(ContactMessage.created_at.desc()).offset(offset).limit(limit)).all()
    return {"total": total, "items": [_msg_out(m) for m in rows]}


@router.patch("/messages/{msg_id}")
def patch_message(msg_id: int, payload: dict, session: Session = Depends(get_session)):
    m = session.get(ContactMessage, msg_id)
    if not m:
        raise HTTPException(404, "Not found")
    for k in ("read", "starred"):
        if k in payload:
            setattr(m, k, bool(payload[k]))
    session.add(m); session.commit(); session.refresh(m)
    return _msg_out(m)


@router.delete("/messages/{msg_id}")
def delete_message(msg_id: int, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    m = session.get(ContactMessage, msg_id)
    if not m:
        raise HTTPException(404, "Not found")
    session.delete(m)
    audit(session, request, admin, "message.delete", target=str(msg_id))
    session.commit()
    return {"ok": True}


# ── offers ─────────────────────────────────────────────────────────────────
OFFER_STATUSES = ("new", "reviewing", "accepted", "declined")


def _offer_out(o: Offer) -> dict:
    d = o.model_dump(exclude={"ip_hash"})
    d["message"] = decrypt_text(o.message)
    d["notes"] = decrypt_text(o.notes) if o.notes else ""
    return d


@router.get("/offers")
def list_offers(status_: Optional[str] = Query(None, alias="status"), q: str = Query("", max_length=100), limit: int = Query(100, le=300), offset: int = 0, session: Session = Depends(get_session)):
    stmt = select(Offer)
    if status_ in OFFER_STATUSES:
        stmt = stmt.where(Offer.status == status_)
    if q:
        like = f"%{q}%"
        stmt = stmt.where((Offer.name.ilike(like)) | (Offer.email.ilike(like)) | (Offer.title.ilike(like)) | (Offer.company.ilike(like)))
    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    rows = session.exec(stmt.order_by(Offer.created_at.desc()).offset(offset).limit(limit)).all()
    return {"total": total, "items": [_offer_out(o) for o in rows]}


@router.patch("/offers/{offer_id}")
def patch_offer(offer_id: int, payload: dict, request: Request, tasks: BackgroundTasks, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    o = session.get(Offer, offer_id)
    if not o:
        raise HTTPException(404, "Not found")
    changed = []
    for k in ("read", "starred"):
        if k in payload:
            setattr(o, k, bool(payload[k]))
    if "notes" in payload:
        o.notes = encrypt_text(str(payload["notes"])[:6000]); changed.append("notes")
    if "status" in payload and payload["status"] in OFFER_STATUSES and payload["status"] != o.status:
        o.status = payload["status"]; changed.append("status")
        if payload.get("notify"):
            tasks.add_task(send_offer_status, o.email, o.name, o.title, o.status, str(payload.get("reply") or "")[:4000])
    o.updated_at = now_utc()
    if changed:
        audit(session, request, admin, "offer.update", target=str(offer_id), detail={"fields": changed, "status": o.status})
    session.add(o); session.commit(); session.refresh(o)
    return _offer_out(o)


@router.delete("/offers/{offer_id}")
def delete_offer(offer_id: int, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    o = session.get(Offer, offer_id)
    if not o:
        raise HTTPException(404, "Not found")
    session.delete(o)
    audit(session, request, admin, "offer.delete", target=str(offer_id))
    session.commit()
    return {"ok": True}


# ── notifications ──────────────────────────────────────────────────────────
@router.get("/notifications")
def list_notifications(unread: bool = False, limit: int = Query(30, le=100), session: Session = Depends(get_session)):
    stmt = select(Notification)
    if unread:
        stmt = stmt.where(Notification.read == False)  # noqa: E712
    rows = session.exec(stmt.order_by(Notification.created_at.desc()).limit(limit)).all()
    unread_count = session.exec(select(func.count()).select_from(Notification).where(Notification.read == False)).one()  # noqa: E712
    return {"unread": unread_count, "items": [r.model_dump() for r in rows]}


@router.post("/notifications/read")
def mark_notifications(payload: dict, session: Session = Depends(get_session)):
    ids = payload.get("ids")
    stmt = select(Notification).where(Notification.read == False)  # noqa: E712
    if isinstance(ids, list) and ids:
        stmt = stmt.where(Notification.id.in_([int(i) for i in ids]))
    for n in session.exec(stmt).all():
        n.read = True; session.add(n)
    session.commit()
    return {"ok": True}


# ── audit trail ────────────────────────────────────────────────────────────
@router.get("/audit")
def audit_log(limit: int = Query(100, le=500), session: Session = Depends(get_session)):
    rows = session.exec(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)).all()
    return [r.model_dump() for r in rows]


@router.post("/cache/clear")
def clear_cache(request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    _invalidate()
    audit(session, request, admin, "cache.clear"); session.commit()
    return {"ok": True}

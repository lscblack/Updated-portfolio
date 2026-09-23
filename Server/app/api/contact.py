"""Public, unauthenticated endpoints: site bootstrap, contact form, captcha and the envelope handshake."""
from __future__ import annotations

import logging
import secrets
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select

from ..core.config import settings
from ..core.mailer import send_contact_notification, send_contact_receipt, send_offer_notification, send_offer_receipt
from ..core.security import constant_eq, encrypt_text, hash_code, hash_ip, now_utc, server_key_id, server_public_key_spki_b64
from ..core.useragent import classify, is_bot
from ..core.store import cache_get, cache_set, kv_del, kv_get, kv_set
from ..db.session import get_session
from ..models import (
    AboutContent, ActivityItem, AdminUser, Certification, ContactMessage, EducationItem,
    ExperienceItem, InterestItem, JourneyMilestone, Notification, Offer, Project, SiteSettings, SkillCategory, Visit,
)
from ..schemas import ContactIn, OfferIn, VisitPing, VisitStart
from .admin_auth import client_ip, rate_limited

log = logging.getLogger(__name__)
router = APIRouter()

SITE_CACHE_KEY = "public:site"


def _rows(session: Session, model, order_attr="order", visible_attr="visible"):
    q = select(model)
    if hasattr(model, visible_attr):
        q = q.where(getattr(model, visible_attr) == True)  # noqa: E712
    q = q.order_by(getattr(model, order_attr), model.id)
    return [r.model_dump() for r in session.exec(q).all()]


def build_site(session: Session) -> dict:
    s = session.get(SiteSettings, 1)
    a = session.get(AboutContent, 1)
    projects = [p.model_dump() for p in session.exec(select(Project).where(Project.public == True).order_by(Project.order, Project.id)).all()]  # noqa: E712
    return {
        "settings": s.model_dump(exclude={"updated_at"}) if s else {},
        "about": a.model_dump() if a else {},
        "journey": _rows(session, JourneyMilestone),
        "experience": _rows(session, ExperienceItem),
        "skills": _rows(session, SkillCategory),
        "projects": projects,
        "education": _rows(session, EducationItem),
        "certifications": _rows(session, Certification),
        "activities": _rows(session, ActivityItem),
        "interests": _rows(session, InterestItem),
        "generated_at": now_utc().isoformat(),
    }


@router.get("/site")
def site(session: Session = Depends(get_session)):
    cached = cache_get(SITE_CACHE_KEY)
    if cached:
        return cached
    data = build_site(session)
    cache_set(SITE_CACHE_KEY, data)
    return data


@router.get("/health")
def health(session: Session = Depends(get_session)):
    session.exec(select(AdminUser.id).limit(1)).first()
    return {"ok": True, "env": settings.APP_ENV, "time": now_utc().isoformat()}


@router.get("/og-image", include_in_schema=False)
def og_image(session: Session = Depends(get_session)):
    """Redirect to the current share image so the static meta tags never go stale."""
    s = session.get(SiteSettings, 1)
    a = session.get(AboutContent, 1)
    url = (s.og_image if s else "") or (a.avatar_url if a else "") or ""
    if not url:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No share image configured")
    return RedirectResponse(url, status_code=status.HTTP_302_FOUND)


@router.get("/handshake")
def handshake():
    """Public key for the optional encrypted request/response envelope."""
    if not settings.PAYLOAD_ENCRYPTION:
        return {"enabled": False}
    return {"enabled": True, "kid": server_key_id(), "alg": "ECDH-P256+HKDF-SHA256+A256GCM", "public_key": server_public_key_spki_b64()}


@router.get("/captcha", dependencies=[Depends(rate_limited("captcha", 30, 60))])
def captcha():
    a, b = secrets.randbelow(9) + 1, secrets.randbelow(9) + 1
    op = secrets.choice(["+", "+", "-", "x"])
    answer = a + b if op == "+" else (a - b if op == "-" else a * b)
    cid = secrets.token_urlsafe(16)
    kv_set(f"captcha:{cid}", hash_code(str(answer), cid), 600)
    return {"id": cid, "question": f"{a} {op} {b}", "ttl": 600}


def _check_captcha(cid: str, answer: str) -> bool:
    answer = (answer or "").strip()
    if settings.captcha_bypass and constant_eq(answer, settings.captcha_bypass):
        return True
    if not cid:
        return False
    stored = kv_get(f"captcha:{cid}")
    kv_del(f"captcha:{cid}")     # single use whatever the outcome
    if not stored:
        return False
    return constant_eq(stored, hash_code(answer.lstrip("+"), cid))


@router.post("/contact", dependencies=[Depends(rate_limited("contact", 10, 300))])
def contact(body: ContactIn, request: Request, tasks: BackgroundTasks, session: Session = Depends(get_session)):
    if body.website:                       # honeypot filled by a bot — pretend success
        return {"ok": True}
    if not _check_captcha(body.captcha_id, body.captcha_answer):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The verification answer is wrong or expired. Please try again.")
    msg = ContactMessage(
        name=body.name.strip(), email=body.email.lower().strip(), subject=body.subject.strip(),
        message=encrypt_text(body.message.strip()),
        ip_hash=hash_ip(client_ip(request)), user_agent=(request.headers.get("user-agent") or "")[:300],
    )
    session.add(msg); session.flush()
    session.add(Notification(kind="message", title=f"New message from {msg.name}", body=msg.subject[:200], link="/admin/messages", ref_id=msg.id))
    session.commit()
    notify_to = _notify_to(session)
    tasks.add_task(send_contact_notification, notify_to, msg.name, msg.email, msg.subject, body.message.strip())
    tasks.add_task(send_contact_receipt, msg.email, msg.name, msg.subject)
    return {"ok": True, "message": "Thanks — your message is in my inbox."}


def _notify_to(session: Session) -> str:
    return settings.CONTACT_NOTIFY_EMAIL or (session.exec(select(AdminUser.email).limit(1)).first() or settings.DEFAULT_ADMIN_EMAIL)


@router.post("/offers", dependencies=[Depends(rate_limited("offers", 12, 600))])
def submit_offer(body: OfferIn, request: Request, tasks: BackgroundTasks, session: Session = Depends(get_session)):
    if body.honeypot:
        return {"ok": True}
    if not _check_captcha(body.captcha_id, body.captcha_answer):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The verification answer is wrong or expired. Please try again.")
    offer = Offer(
        name=body.name.strip(), email=body.email.lower().strip(), company=body.company.strip(), website=body.website.strip(),
        kind=body.kind, title=body.title.strip(), budget=body.budget.strip(), timeline=body.timeline.strip(),
        message=encrypt_text(body.message.strip()),
        ip_hash=hash_ip(client_ip(request)), user_agent=(request.headers.get("user-agent") or "")[:300],
    )
    session.add(offer); session.flush()
    session.add(Notification(kind="offer", title=f"New {offer.kind} offer: {offer.title}", body=f"{offer.name}{' · ' + offer.company if offer.company else ''}"[:200], link="/admin/offers", ref_id=offer.id))
    session.commit()
    summary = {"name": offer.name, "email": offer.email, "company": offer.company, "website": offer.website, "kind": offer.kind,
               "title": offer.title, "budget": offer.budget, "timeline": offer.timeline, "message": body.message.strip()}
    tasks.add_task(send_offer_notification, _notify_to(session), summary)
    tasks.add_task(send_offer_receipt, offer.email, offer.name, offer.title)
    return {"ok": True, "message": "Thanks — your offer is in. I will reply by email."}


# ── visit analytics ────────────────────────────────────────────────────────
@router.post("/visit", dependencies=[Depends(rate_limited("visit", 40, 300))])
def start_visit(body: VisitStart, request: Request, session: Session = Depends(get_session)):
    """Open a session. Bots and dashboard traffic are ignored; only a hash of the device id is stored."""
    ua = (request.headers.get("user-agent") or "")[:300]
    if is_bot(ua) or body.path.startswith("/admin"):
        return {"ok": True, "tracked": False}
    device, browser, os_name = classify(ua)
    sid = secrets.token_urlsafe(18)
    ref = body.referrer.strip()
    # a referrer from our own domain is a navigation, not a source
    host = (request.headers.get("host") or "").split(":")[0]
    if host and host in ref:
        ref = ""
    session.add(Visit(
        session_id=sid, visitor_hash=hash_ip(body.visitor),      # keyed hash — the raw id is never stored
        entry_path=body.path[:200], referrer=ref[:300], device=device, browser=browser, os=os_name,
        screen=body.screen[:24], timezone=body.timezone[:64], language=body.language[:16],
        country=(request.headers.get("cf-ipcountry") or request.headers.get("x-country") or "")[:8],
    ))
    session.commit()
    return {"ok": True, "tracked": True, "session": sid}


@router.post("/visit/{session_id}/ping", dependencies=[Depends(rate_limited("visitping", 240, 300))])
def ping_visit(session_id: str, body: VisitPing, session: Session = Depends(get_session)):
    """Update how long the visit lasted and how much happened in it. Values only ever move forward."""
    v = session.exec(select(Visit).where(Visit.session_id == session_id)).first()
    if not v:
        return {"ok": False}
    v.duration_seconds = max(v.duration_seconds, body.duration)
    v.interactions = max(v.interactions, body.interactions)
    v.max_scroll = max(v.max_scroll, body.max_scroll)
    v.pages = max(v.pages, body.pages)
    if body.sections:
        v.sections = sorted(set([*(v.sections or []), *[x[:40] for x in body.sections[:30]]]))
    v.last_seen_at = now_utc()
    session.add(v); session.commit()
    return {"ok": True}

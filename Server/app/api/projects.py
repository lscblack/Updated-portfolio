"""GitHub helpers for the dashboard: browse public repositories and import them as projects."""
from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlmodel import Session, func, select

from ..core.config import settings
from ..core.store import cache_clear, cache_get, cache_set
from ..db.session import get_session
from ..models import AdminUser, Project
from .admin_auth import audit, get_current_admin
from .contact import SITE_CACHE_KEY

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/github/repos")
def github_repos(username: str = Query(default="", max_length=60), refresh: bool = False):
    user = (username or settings.GITHUB_USERNAME).strip()
    key = f"github:{user}"
    if not refresh:
        cached = cache_get(key)
        if cached:
            return cached
    try:
        with httpx.Client(timeout=12, headers={"Accept": "application/vnd.github+json", "User-Agent": "lscblack-portfolio"}) as c:
            r = c.get(f"{settings.GITHUB_API_BASE}/users/{user}/repos", params={"per_page": 100, "sort": "updated"})
            r.raise_for_status()
            repos = r.json()
    except httpx.HTTPError as e:
        raise HTTPException(502, f"GitHub unavailable: {e}")
    slim = [{
        "id": x["id"], "name": x["name"], "description": x.get("description") or "", "html_url": x["html_url"],
        "homepage": x.get("homepage") or "", "language": x.get("language") or "", "topics": x.get("topics") or [],
        "stars": x.get("stargazers_count", 0), "forks": x.get("forks_count", 0), "updated_at": x.get("pushed_at") or x.get("updated_at"),
        "fork": x.get("fork", False), "archived": x.get("archived", False),
    } for x in repos if isinstance(x, dict)]
    cache_set(key, slim, 900)
    return slim


@router.post("/github/import", status_code=201)
def import_repo(payload: dict, request: Request, session: Session = Depends(get_session), admin: AdminUser = Depends(get_current_admin)):
    name = (payload.get("name") or "").strip()
    url = (payload.get("html_url") or "").strip()
    if not name or not url.startswith("https://github.com/"):
        raise HTTPException(400, "A GitHub repository is required")
    existing = session.exec(select(Project).where(Project.github_url == url)).first()
    if existing:
        raise HTTPException(409, "This repository is already a project")
    title = name.replace("-", " ").replace("_", " ").strip().title()
    tech = [t for t in ([payload.get("language")] + list(payload.get("topics") or [])) if t][:8]
    row = Project(
        title=title, description=payload.get("description") or "", github_url=url, live_url=payload.get("homepage") or "",
        technologies=tech, categories=["Open Source"], public=bool(payload.get("public", True)), featured=False,
        year=str(payload.get("updated_at") or "")[:4],
        order=(session.exec(select(func.max(Project.order))).one() or 0) + 1,
    )
    session.add(row); session.flush()
    audit(session, request, admin, "projects.import", target=str(row.id), detail={"repo": name})
    session.commit(); session.refresh(row)
    cache_clear(SITE_CACHE_KEY)
    return row

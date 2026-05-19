import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from sqlmodel import Session, select

from ..db.session import engine
from ..models.content import (
    AboutContent, ExperienceItem, SkillItem, SkillProject,
    ActivityItem, InterestItem,
)

router = APIRouter()


# ── About ──────────────────────────────────────────────────────────────────
class AboutUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    tagline: Optional[str] = None
    bio_para1: Optional[str] = None
    bio_para2: Optional[str] = None
    quote: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    open_to: Optional[str] = None


@router.get("/about")
def get_about():
    with Session(engine) as s:
        about = s.get(AboutContent, 1)
        if not about:
            about = AboutContent()
            s.add(about)
            s.commit()
            s.refresh(about)
        return about


@router.patch("/about")
def update_about(payload: AboutUpdate):
    with Session(engine) as s:
        about = s.get(AboutContent, 1)
        if not about:
            about = AboutContent()
            s.add(about)
            s.commit()
            s.refresh(about)
        for k, v in payload.model_dump(exclude_none=True).items():
            setattr(about, k, v)
        s.add(about)
        s.commit()
        s.refresh(about)
        return about


# ── Experience ─────────────────────────────────────────────────────────────
class ExperienceCreate(BaseModel):
    num: str
    title: str
    company: str
    location: str
    period: str
    job_type: str
    bullets: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    order: int = 0
    visible: bool = True


@router.get("/experience")
def list_experience():
    with Session(engine) as s:
        items = s.exec(select(ExperienceItem).order_by(ExperienceItem.order)).all()
        result = []
        for item in items:
            d = item.model_dump()
            d['bullets'] = json.loads(item.bullets) if item.bullets else []
            d['tags'] = json.loads(item.tags) if item.tags else []
            result.append(d)
        return result


@router.post("/experience")
def create_experience(payload: ExperienceCreate):
    with Session(engine) as s:
        item = ExperienceItem(
            **{k: v for k, v in payload.model_dump().items() if k not in ('bullets', 'tags')},
            bullets=json.dumps(payload.bullets or []),
            tags=json.dumps(payload.tags or []),
        )
        s.add(item)
        s.commit()
        s.refresh(item)
        return item


@router.put("/experience/{item_id}")
def update_experience(item_id: int, payload: ExperienceCreate):
    with Session(engine) as s:
        item = s.get(ExperienceItem, item_id)
        if not item:
            raise HTTPException(404, "Not found")
        for k, v in payload.model_dump().items():
            if k == 'bullets':
                item.bullets = json.dumps(v or [])
            elif k == 'tags':
                item.tags = json.dumps(v or [])
            else:
                setattr(item, k, v)
        s.add(item)
        s.commit()
        s.refresh(item)
        return item


@router.delete("/experience/{item_id}")
def delete_experience(item_id: int):
    with Session(engine) as s:
        item = s.get(ExperienceItem, item_id)
        if not item:
            raise HTTPException(404, "Not found")
        s.delete(item)
        s.commit()
        return {"ok": True}


# ── Skills ─────────────────────────────────────────────────────────────────
@router.get("/skills")
def list_skills():
    with Session(engine) as s:
        return s.exec(select(SkillItem).order_by(SkillItem.category, SkillItem.order)).all()


@router.post("/skills")
def create_skill(payload: SkillItem):
    with Session(engine) as s:
        s.add(payload)
        s.commit()
        s.refresh(payload)
        return payload


@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: int):
    with Session(engine) as s:
        item = s.get(SkillItem, skill_id)
        if not item:
            raise HTTPException(404, "Not found")
        s.delete(item)
        s.commit()
        return {"ok": True}


# ── Projects (enhanced GET with DB projects) ───────────────────────────────
@router.get("/projects/all")
def list_all_projects():
    from ..models.project import Project
    with Session(engine) as s:
        return s.exec(select(Project)).all()

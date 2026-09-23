"""Every editable section of the public site. *Base classes are the validated input shapes;
the table classes add the primary key."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, JSON, Text
from sqlmodel import Field, SQLModel

from .base import utcnow


# ── site-wide settings (singleton, id=1) ───────────────────────────────────
class SiteSettingsBase(SQLModel):
    site_name: str = Field(default="Loue Sauveur Christian", max_length=120)
    logo_text: str = Field(default="lsc", max_length=24)
    seo_title: str = Field(default="", max_length=200)
    seo_description: str = Field(default="", sa_column=Column(Text))
    seo_keywords: str = Field(default="", sa_column=Column(Text))
    canonical_url: str = Field(default="https://lscblack.tech", max_length=200)
    og_image: str = Field(default="", max_length=500)

    hero_kicker: str = Field(default="", max_length=120)
    hero_phrases: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    hero_intro: str = Field(default="", sa_column=Column(Text))
    hero_primary_label: str = Field(default="View my work", max_length=40)
    hero_primary_href: str = Field(default="#projects", max_length=200)
    hero_secondary_label: str = Field(default="Download CV", max_length=40)
    hero_secondary_href: str = Field(default="/resume.pdf", max_length=300)
    resume_url: str = Field(default="", max_length=300)
    availability_text: str = Field(default="Available for opportunities", max_length=80)
    available: bool = Field(default=True)
    metrics: List[dict] = Field(default_factory=list, sa_column=Column(JSON))          # [{value,label,sub}]
    marquee: List[str] = Field(default_factory=list, sa_column=Column(JSON))           # tech strip
    live_sites: List[dict] = Field(default_factory=list, sa_column=Column(JSON))       # [{label,url}]
    social_links: List[dict] = Field(default_factory=list, sa_column=Column(JSON))     # [{label,url,icon}]

    sections: List[dict] = Field(default_factory=list, sa_column=Column(JSON))         # [{key,label,visible}]
    section_titles: dict = Field(default_factory=dict, sa_column=Column(JSON))         # {key:{label,title,subtitle}}
    contact_intro: str = Field(default="", sa_column=Column(Text))
    footer_text: str = Field(default="", max_length=200)

    theme: dict = Field(default_factory=dict, sa_column=Column(JSON))
    fonts: dict = Field(default_factory=dict, sa_column=Column(JSON))
    effects: dict = Field(default_factory=dict, sa_column=Column(JSON))


class SiteSettings(SiteSettingsBase, table=True):
    __tablename__ = "site_settings"
    id: Optional[int] = Field(default=None, primary_key=True)
    updated_at: datetime = Field(default_factory=utcnow)


# ── about (singleton, id=1) ────────────────────────────────────────────────
class AboutBase(SQLModel):
    name: str = Field(default="", max_length=120)
    role: str = Field(default="", max_length=120)
    headline: str = Field(default="", max_length=200)          # big statement
    headline_highlight: str = Field(default="", max_length=80) # substring rendered in the accent colour
    bio: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    quote: str = Field(default="", sa_column=Column(Text))
    email: str = Field(default="", max_length=160)
    phone: str = Field(default="", max_length=40)
    location: str = Field(default="", max_length=120)
    avatar_url: str = Field(default="", max_length=500)
    gallery: List[str] = Field(default_factory=list, sa_column=Column(JSON))   # rotating portraits
    open_to: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    currently: List[dict] = Field(default_factory=list, sa_column=Column(JSON))   # [{role, org, url}]
    languages: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    facts: List[dict] = Field(default_factory=list, sa_column=Column(JSON))       # [{label, value}]


class AboutContent(AboutBase, table=True):
    __tablename__ = "about_content"
    id: Optional[int] = Field(default=None, primary_key=True)


# ── journey milestones (the walking timeline) ─────────────────────────────
class JourneyBase(SQLModel):
    year: str = Field(max_length=24)
    title: str = Field(max_length=160)
    subtitle: str = Field(default="", max_length=160)
    description: str = Field(default="", sa_column=Column(Text))
    kind: str = Field(default="work", max_length=24)     # education | work | project | award | life
    icon: str = Field(default="Flag", max_length=40)
    location: str = Field(default="", max_length=120)
    link: str = Field(default="", max_length=300)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    order: int = Field(default=0)
    visible: bool = Field(default=True)


class JourneyMilestone(JourneyBase, table=True):
    __tablename__ = "journey_milestone"
    id: Optional[int] = Field(default=None, primary_key=True)


# ── experience ────────────────────────────────────────────────────────────
class ExperienceBase(SQLModel):
    title: str = Field(max_length=160)
    company: str = Field(max_length=160)
    company_url: str = Field(default="", max_length=300)
    location: str = Field(default="", max_length=120)
    period: str = Field(default="", max_length=64)
    job_type: str = Field(default="", max_length=64)
    summary: str = Field(default="", sa_column=Column(Text))
    bullets: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    logo_url: str = Field(default="", max_length=500)
    current: bool = Field(default=False)
    order: int = Field(default=0)
    visible: bool = Field(default=True)


class ExperienceItem(ExperienceBase, table=True):
    __tablename__ = "experience_item"
    id: Optional[int] = Field(default=None, primary_key=True)


# ── skills ────────────────────────────────────────────────────────────────
class SkillCategoryBase(SQLModel):
    name: str = Field(max_length=80)
    icon: str = Field(default="Code2", max_length=40)
    skills: List[dict] = Field(default_factory=list, sa_column=Column(JSON))    # [{name, level(0-100)}]
    applied: List[dict] = Field(default_factory=list, sa_column=Column(JSON))   # [{name, url}]
    order: int = Field(default=0)
    visible: bool = Field(default=True)


class SkillCategory(SkillCategoryBase, table=True):
    __tablename__ = "skill_category"
    id: Optional[int] = Field(default=None, primary_key=True)


# ── education & certifications ────────────────────────────────────────────
class EducationBase(SQLModel):
    period: str = Field(default="", max_length=48)
    kind: str = Field(default="degree", max_length=32)
    title: str = Field(max_length=160)
    subtitle: str = Field(default="", max_length=160)
    org: str = Field(default="", max_length=160)
    location: str = Field(default="", max_length=120)
    note: str = Field(default="", sa_column=Column(Text))
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    url: str = Field(default="", max_length=300)
    status: str = Field(default="", max_length=40)
    order: int = Field(default=0)
    visible: bool = Field(default=True)


class EducationItem(EducationBase, table=True):
    __tablename__ = "education_item"
    id: Optional[int] = Field(default=None, primary_key=True)


class CertificationBase(SQLModel):
    title: str = Field(max_length=160)
    issuer: str = Field(default="", max_length=160)
    grade: str = Field(default="", max_length=32)
    year: str = Field(default="", max_length=16)
    url: str = Field(default="", max_length=400)
    order: int = Field(default=0)
    visible: bool = Field(default=True)


class Certification(CertificationBase, table=True):
    __tablename__ = "certification"
    id: Optional[int] = Field(default=None, primary_key=True)


# ── life beyond code & interests ──────────────────────────────────────────
class ActivityBase(SQLModel):
    label: str = Field(max_length=80)
    icon: str = Field(default="Sparkles", max_length=40)
    quote: str = Field(default="", sa_column=Column(Text))
    media_url: str = Field(default="", max_length=500)          # photo or short clip of the activity
    media_kind: str = Field(default="image", max_length=16)     # image | video
    caption: str = Field(default="", max_length=160)
    order: int = Field(default=0)
    visible: bool = Field(default=True)


class ActivityItem(ActivityBase, table=True):
    __tablename__ = "activity_item"
    id: Optional[int] = Field(default=None, primary_key=True)


class InterestBase(SQLModel):
    title: str = Field(max_length=120)
    icon: str = Field(default="Compass", max_length=40)
    items: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    order: int = Field(default=0)
    visible: bool = Field(default=True)


class InterestItem(InterestBase, table=True):
    __tablename__ = "interest_item"
    id: Optional[int] = Field(default=None, primary_key=True)


# ── contact inbox ─────────────────────────────────────────────────────────
class Offer(SQLModel, table=True):
    """A hire / collaboration proposal submitted from the public site."""
    __tablename__ = "offer"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=120)
    email: str = Field(max_length=200)
    company: str = Field(default="", max_length=160)
    website: str = Field(default="", max_length=300)
    kind: str = Field(default="job", max_length=32)          # job | contract | freelance | research | collaboration | other
    title: str = Field(max_length=200)
    budget: str = Field(default="", max_length=64)
    timeline: str = Field(default="", max_length=64)
    message: str = Field(sa_column=Column(Text))            # encrypted at rest
    status: str = Field(default="new", max_length=24)        # new | reviewing | accepted | declined
    notes: str = Field(default="", sa_column=Column(Text))  # private, encrypted
    ip_hash: str = Field(default="", max_length=64)
    user_agent: str = Field(default="", max_length=300)
    read: bool = Field(default=False)
    starred: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow, index=True)
    updated_at: datetime = Field(default_factory=utcnow)


class Notification(SQLModel, table=True):
    """In-app notification for the dashboard bell."""
    __tablename__ = "notification"

    id: Optional[int] = Field(default=None, primary_key=True)
    kind: str = Field(default="info", max_length=32)         # offer | message | system
    title: str = Field(max_length=200)
    body: str = Field(default="", max_length=500)
    link: str = Field(default="", max_length=200)
    ref_id: Optional[int] = None
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow, index=True)


class ContactMessage(SQLModel, table=True):
    __tablename__ = "contact_message"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=120)
    email: str = Field(max_length=200)
    subject: str = Field(max_length=200)
    message: str = Field(sa_column=Column(Text))        # encrypted at rest
    ip_hash: str = Field(default="", max_length=64)
    user_agent: str = Field(default="", max_length=300)
    read: bool = Field(default=False)
    starred: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow, index=True)

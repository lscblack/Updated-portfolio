"""Portfolio projects (featured/contributed and other work)."""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import Column, JSON, Text
from sqlmodel import Field, SQLModel


class ProjectBase(SQLModel):
    title: str = Field(max_length=160)
    slug: str = Field(default="", max_length=160)
    description: str = Field(default="", sa_column=Column(Text))
    role: str = Field(default="", max_length=120)
    year: str = Field(default="", max_length=32)
    featured: bool = Field(default=False)          # shown in the large "contributed" cards
    public: bool = Field(default=True)
    github_url: str = Field(default="", max_length=300)
    live_url: str = Field(default="", max_length=300)
    image_url: str = Field(default="", max_length=500)
    technologies: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    categories: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    highlights: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    status: str = Field(default="production", max_length=32)
    order: int = Field(default=0)


class Project(ProjectBase, table=True):
    __tablename__ = "project"
    id: Optional[int] = Field(default=None, primary_key=True)

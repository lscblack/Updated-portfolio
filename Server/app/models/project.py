from typing import Optional, List
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    public: bool = True
    github_url: Optional[str] = None
    technologies: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    extra_data: Optional[str] = None  # was 'metadata' — renamed to avoid SQLModel conflict
    status: Optional[str] = "production"

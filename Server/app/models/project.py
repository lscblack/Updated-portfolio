from typing import Optional, List
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    public: bool = True
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    technologies: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    categories: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    extra_data: Optional[str] = None
    status: Optional[str] = "production"
    order: int = 0
    contributed: bool = True

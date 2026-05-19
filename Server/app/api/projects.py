from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db.session import engine
from ..models.project import Project

router = APIRouter()


class ProjectPayload(BaseModel):
    title: str
    description: Optional[str] = None
    public: bool = True
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    technologies: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    status: Optional[str] = "production"
    order: int = 0
    contributed: bool = True


@router.get("/", response_model=List[Project])
def list_projects():
    with Session(engine) as s:
        return s.exec(select(Project).order_by(Project.order)).all()


@router.post("/", response_model=Project)
def create_project(payload: ProjectPayload):
    p = Project(**payload.model_dump())
    with Session(engine) as s:
        s.add(p)
        s.commit()
        s.refresh(p)
        return p


@router.put("/{project_id}", response_model=Project)
def update_project(project_id: int, payload: ProjectPayload):
    with Session(engine) as s:
        p = s.get(Project, project_id)
        if not p:
            raise HTTPException(404, "Project not found")
        for k, v in payload.model_dump().items():
            setattr(p, k, v)
        s.add(p)
        s.commit()
        s.refresh(p)
        return p


@router.delete("/{project_id}")
def delete_project(project_id: int):
    with Session(engine) as s:
        p = s.get(Project, project_id)
        if not p:
            raise HTTPException(404, "Project not found")
        s.delete(p)
        s.commit()
        return {"ok": True}

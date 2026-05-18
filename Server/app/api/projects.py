from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel import Session, select
import httpx

from ..db.session import engine
from ..models.project import Project
from ..schemas import ProjectCreate, ProjectRead
from ..core.config import settings

router = APIRouter()


@router.post("/", response_model=ProjectRead)
def create_project(payload: ProjectCreate):
    project = Project(**payload.dict())
    with Session(engine) as session:
        session.add(project)
        session.commit()
        session.refresh(project)
        return project


@router.get("/", response_model=List[ProjectRead])
def list_projects():
    with Session(engine) as session:
        projects = session.exec(select(Project)).all()
        return projects


@router.post("/sync_github")
def sync_github(token: str):
    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
    url = f"{settings.GITHUB_API_BASE}/user/repos"
    with httpx.Client() as client:
        resp = client.get(url, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="GitHub fetch failed")
        repos = resp.json()
        results = []
        with Session(engine) as session:
            for r in repos:
                obj = Project(
                    title=r.get("name"),
                    description=r.get("description"),
                    github_url=r.get("html_url"),
                    technologies=[r.get("language")] if r.get("language") else [],
                    public=not r.get("private", False),
                )
                session.add(obj)
                session.commit()
                session.refresh(obj)
                results.append(obj)
        return {"imported": len(results)}

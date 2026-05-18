from typing import List, Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    github_url: Optional[str] = None
    technologies: Optional[List[str]] = None
    public: bool = True


class ProjectRead(ProjectCreate):
    id: int
    status: Optional[str]

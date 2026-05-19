from typing import Optional
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON, Text


class AboutContent(SQLModel, table=True):
    id: int = Field(default=1, primary_key=True)
    name: str = "Loue Sauveur Christian"
    role: str = "Senior Software Engineer"
    tagline: str = "Building systems that protect people, not just data."
    bio_para1: str = (
        "I'm a software engineer with 3+ years building production systems across Rwanda's government, "
        "fintech, and health sectors. I've encrypted national land registry data protecting millions of "
        "citizens, integrated AI models into mobile health apps, and shipped payment infrastructure across "
        "borders — always with security designed in, not bolted on."
    )
    bio_para2: str = (
        "Currently completing my B.Sc. Software Engineering (ML Specialisation) at the African Leadership "
        "University while holding three parallel roles. Applying for MSc Cybersecurity — driven by the "
        "conviction that defending digital infrastructure is the next frontier for Africa."
    )
    quote: str = (
        "I believe Africa's digital future needs engineers who build things that are not only functional, "
        "but secure and trusted."
    )
    email: str = "louesauveur18@gmail.com"
    phone: str = "+250 790 110 231"
    github: str = "https://github.com/lscblack"
    linkedin: str = "https://www.linkedin.com/in/christian-loue-sauveur/"
    location: str = "Kigali, Rwanda"
    avatar_url: str = "https://avatars.githubusercontent.com/u/141139366?v=4"
    open_to: str = "MSc Cybersecurity programmes, Research Collaborations, Engineering Roles"


class ExperienceItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    num: str
    title: str
    company: str
    location: str
    period: str
    job_type: str
    bullets: Optional[str] = Field(default=None, sa_column=Column(Text))
    tags: Optional[str] = Field(default=None, sa_column=Column(Text))
    order: int = 0
    visible: bool = True


class SkillItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str
    name: str
    level: str
    order: int = 0


class SkillProject(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str
    name: str
    url: Optional[str] = None
    order: int = 0


class ActivityItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    icon_name: str
    quote: str
    order: int = 0


class InterestItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    num: str
    title: str
    items: Optional[str] = Field(default=None, sa_column=Column(Text))
    order: int = 0

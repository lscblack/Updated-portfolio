from typing import Optional
from sqlmodel import SQLModel, Field


class AdminCredentials(SQLModel, table=True):
    id: int = Field(default=1, primary_key=True)
    username: str = "lscblack"
    hashed_password: str = ""  # seeded at startup

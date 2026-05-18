from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

from ..core.config import settings
from ..db.session import engine
from ..models.user import User
from ..schemas import UserCreate, Token, UserRead

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post("/register", response_model=UserRead)
def register(data: UserCreate):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == data.email)).first()
        if user:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed = get_password_hash(data.password)
        user = User(email=data.email, full_name=data.full_name, hashed_password=hashed)
        session.add(user)
        session.commit()
        session.refresh(user)
        return UserRead(id=user.id, email=user.email, full_name=user.full_name)


@router.post("/login", response_model=Token)
def login(data: UserCreate):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == data.email)).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        token = create_access_token(str(user.id))
        return Token(access_token=token)

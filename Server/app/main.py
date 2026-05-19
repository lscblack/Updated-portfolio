from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlmodel import Session

from .api import auth, projects, contact, content, admin_auth
from .db.session import init_db, engine
from .models.admin import AdminCredentials


def _seed_admin():
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    with Session(engine) as s:
        admin = s.get(AdminCredentials, 1)
        if not admin:
            s.add(AdminCredentials(hashed_password=pwd.hash("Chriss@123")))
            s.commit()
        elif not admin.hashed_password:
            admin.hashed_password = pwd.hash("Chriss@123")
            s.add(admin)
            s.commit()


def create_app() -> FastAPI:
    app = FastAPI(title="Loue Sauveur Christian — Portfolio API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(projects.router, prefix="/projects", tags=["projects"])
    app.include_router(contact.router, prefix="/api", tags=["contact"])
    app.include_router(content.router, prefix="/api", tags=["content"])
    app.include_router(admin_auth.router, prefix="/api", tags=["admin-auth"])

    @app.on_event("startup")
    def on_startup():
        init_db()
        _seed_admin()

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

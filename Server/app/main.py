from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth, projects
from .db.session import init_db


def create_app() -> FastAPI:
    app = FastAPI(title="Loue Sauveur Christian — Portfolio API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(projects.router, prefix="/projects", tags=["projects"])

    @app.on_event("startup")
    def on_startup():
        init_db()

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

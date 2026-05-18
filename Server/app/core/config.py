from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Loue Sauveur Christian Portfolio API"
    DATABASE_URL: str = "sqlite:///./dev.db"
    JWT_SECRET: str = "change-this-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    GITHUB_API_BASE: str = "https://api.github.com"

    class Config:
        env_file = ".env"


settings = Settings()

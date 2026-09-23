"""Database engine + schema bootstrap (create database, tables and any missing columns)."""
from __future__ import annotations

import logging
import time
from typing import Iterator

from sqlalchemy import create_engine as _sa_create_engine, inspect, text
from sqlalchemy.engine import Engine
from sqlmodel import SQLModel, Session, create_engine

from ..core.config import settings

log = logging.getLogger(__name__)

# PostgreSQL only — see settings.database_url
engine: Engine = create_engine(
    settings.database_url, echo=False,
    pool_pre_ping=True, pool_size=5, max_overflow=10, pool_recycle=1800,
)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session


def ensure_database(wait_seconds: int = 60) -> None:
    """Wait for the PostgreSQL server and create the application database if missing."""
    admin = _sa_create_engine(settings.admin_db_url, isolation_level="AUTOCOMMIT", pool_pre_ping=True)
    deadline = time.time() + wait_seconds
    last = None
    while True:
        try:
            with admin.connect() as conn:
                exists = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = :n"), {"n": settings.db_name}).scalar()
                if not exists:
                    safe = settings.db_name.replace('"', '""')
                    conn.execute(text(f'CREATE DATABASE "{safe}"'))
                    log.info("Created database %s", settings.db_name)
            break
        except Exception as e:  # server not up yet
            last = e
            if time.time() > deadline:
                raise RuntimeError(f"PostgreSQL not reachable at {settings.DB_HOST}: {last}") from e
            time.sleep(1.5)
    admin.dispose()


def _add_missing_columns() -> None:
    """Additive migrations: new model columns are added to existing tables (never dropped)."""
    insp = inspect(engine)
    existing_tables = set(insp.get_table_names())
    with engine.begin() as conn:
        for table in SQLModel.metadata.sorted_tables:
            if table.name not in existing_tables:
                continue
            cols = {c["name"] for c in insp.get_columns(table.name)}
            for col in table.columns:
                if col.name in cols:
                    continue
                ddl = col.type.compile(dialect=engine.dialect)
                default = ""
                if col.default is not None and getattr(col.default, "arg", None) is not None and not callable(col.default.arg):
                    v = col.default.arg
                    default = f" DEFAULT {'TRUE' if v is True else 'FALSE' if v is False else repr(v) if isinstance(v, str) else v}"
                conn.execute(text(f'ALTER TABLE "{table.name}" ADD COLUMN "{col.name}" {ddl}{default}'))
                log.info("Added column %s.%s", table.name, col.name)


def init_db() -> None:
    from .. import models  # noqa: F401  (register tables)
    SQLModel.metadata.create_all(engine)
    _add_missing_columns()

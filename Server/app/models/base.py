"""Shared model helpers."""
from datetime import datetime, timezone


def utcnow() -> datetime:
    """Timezone-aware UTC timestamp.

    SQLModel/SQLAlchemy map `datetime` columns to TIMESTAMP WITH TIME ZONE and reject naive
    values, so every stored timestamp must carry its offset.
    """
    return datetime.now(timezone.utc)

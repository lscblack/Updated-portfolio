"""Run before the service starts: wait for PostgreSQL, create the database, tables, columns and defaults."""
import logging

from app.db.session import ensure_database, init_db
from app.seed import seed

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
ensure_database()
init_db()
seed()
print("prestart OK")

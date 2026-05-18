FastAPI backend scaffold for Loue Sauveur Christian portfolio

Quick start (local):

1. create a virtualenv and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. run the app:

```bash
uvicorn app.main:app --reload
```

3. API will be available at `http://localhost:8000`.

Notes: This is a scaffold with JWT auth and a basic GitHub import endpoint. Configure `JWT_SECRET` and `DATABASE_URL` via `.env` for production.

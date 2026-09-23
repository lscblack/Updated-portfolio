# Portfolio API

FastAPI + SQLModel on PostgreSQL (PostgreSQL only — SQLite is rejected at startup). See the root README for the full picture.

```
app/main.py            app factory, middleware stack, routers
app/core/config.py     settings (.env)          app/core/security.py   argon2, JWT, OTP, Fernet, ECDH key
app/core/middleware.py security headers, HTTPS, global rate limit, encrypted envelope
app/core/store.py      Redis / in-memory cache + rate-limit counters
app/core/mailer.py     SMTP (OTP, contact notification + receipt)
app/db/session.py      engine, create-database, create-tables, additive column migrations
app/models/            SiteSettings, AboutContent, JourneyMilestone, ExperienceItem, SkillCategory, Project,
                       EducationItem, Certification, ActivityItem, InterestItem, ContactMessage, AdminUser, …
app/api/contact.py     GET /api/public/site|health|handshake|captcha, POST /api/public/contact
app/api/auth.py        POST /api/admin/auth/login|verify|logout|logout-all, GET me, PATCH credentials
app/api/content.py     GET/PATCH /api/admin/settings|about, CRUD /api/admin/c/{collection}, inbox, audit
app/api/uploads.py     POST/GET/DELETE /api/admin/uploads
app/api/projects.py    GET /api/admin/github/repos, POST /api/admin/github/import
app/seed.py            default content (only inserted into empty tables)
prestart.py            wait for DB → create DB → tables → seed  (run by systemd before start)
```

Run: `python prestart.py && uvicorn app.main:app --port 8020`. Docs at `/docs` (development only).

# lscblack.tech — portfolio

Personal portfolio of Loue Sauveur Christian: a React front end with a scroll-driven "walk through my
story" journey, and a FastAPI + PostgreSQL back end with a dashboard that controls every word, colour and
font on the site.

```
Clients/   React 19 + Vite 8 + Tailwind 4 + Framer Motion   (public site + /admin dashboard)
Server/    FastAPI + SQLModel + PostgreSQL                    (public API + admin API)
deploy/    deploy.sh, nginx templates, systemd unit, `lsc` CLI for the production server
```

## Run locally

Backend (conda env `fastapi_setup`, PostgreSQL on 127.0.0.1):

```bash
cd Server
cp .env.example .env            # edit DB_PASSWORD, SMTP, admin credentials
python prestart.py              # creates the database, tables and default content
uvicorn app.main:app --port 8020
```

Frontend (proxies `/api` and `/uploads` to port 8020):

```bash
cd Clients
pnpm install
pnpm dev                        # http://localhost:5180  (PORT=5181 VITE_POLL=1 pnpm dev if inotify is exhausted)
```

Dashboard: `/admin` — sign in with `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD`; a one-time code is
emailed (accounts listed in `OTP_BYPASS_EMAIL` may also use `OTP_BYPASS_CODE`).

## What the dashboard controls

| Page | Controls |
| --- | --- |
| Appearance | theme presets, accent colours, dark/light tones, corner radius, default mode, Google Fonts (display / body / mono), effects (preloader, walker, particles, cursor glow, grain, marquee) |
| Site & hero | site name, logo text, SEO, hero kicker/phrases/intro/buttons, resume PDF upload (rendered in-app at /resume), metrics, tech marquee, live sites, social links, section order + visibility + titles, contact intro, footer |
| About | name, role, headline + highlighted phrase, rotating portrait gallery, biography, quote, contact, languages, open-to, current roles, quick facts |
| Journey / Experience / Skills / Projects / Education / Certifications / Life / Interests | drag-to-reorder lists with a schema-driven editor, visibility toggles, icons, images |
| GitHub import | pull public repositories and turn them into projects |
| Offers | hire-me proposals (job, contract, freelance, research, collaboration): status workflow with email to the sender, private notes; you are emailed and get an in-app notification (bell) for every offer and message |
| Audience | unique devices, visits, time on site, interactions, scroll depth, device/browser/OS, referrers, sections reached, daily trend |
| Inbox | contact-form messages (encrypted at rest), star / read / delete |
| Media | image uploads (re-encoded, metadata stripped) |
| Security | change email / name / password, sign out everywhere, audit log |

## Analytics

Self-hosted and cookie-free. The browser keeps a random device id in `localStorage`; the server stores only
a keyed hash of it, so repeat visits can be recognised without identifying anyone and no IP address is kept.
Bots, the dashboard itself and visitors sending Do-Not-Track are never recorded. Each session reports
cumulative active time (paused when the tab is hidden or idle for a minute), interactions, scroll depth and
the sections actually reached — so a dropped beacon never loses earlier progress.

## Security

- Sign-in = password (argon2id) + emailed one-time code; lockout after repeated failures; token
  version bump revokes every session when the password changes.
- Every write endpoint requires a bearer token; per-IP rate limits on auth, contact and globally.
- Contact form: server-issued arithmetic captcha (single use) + honeypot; messages encrypted (Fernet)
  before they reach PostgreSQL; notification + receipt emails.
- Optional end-to-end envelope between browser and API (ECDH P-256 → HKDF → AES-256-GCM) on top of TLS
  for dashboard and contact traffic (`PAYLOAD_ENCRYPTION`).
- Security headers on every response (CSP, HSTS in production, nosniff, frame-ancestors none, …),
  HTTPS enforcement behind nginx, uploads validated with Pillow and renamed, audit log of admin actions.

## Deploy (Ubuntu + systemd + nginx + certbot)

DNS first: `lscblack.tech`, `www.lscblack.tech` and `api.lscblack.tech` → the server IP. Then, on the server:

```bash
cd /var/www/Updated-portfolio          # wherever the repo is checked out — it deploys in place

cp Server/.env.production.example Server/.env.production
nano Server/.env.production            # DB_USER/DB_PASSWORD, SMTP, DEFAULT_ADMIN_* (secrets are generated if blank)

# the base interpreter (once):  conda create -n fastapi_setup python=3.11
sudo bash deploy/deploy.sh             # add --install-packages the first time if nginx/psql/node are missing
```

The application runs from the **`fastapi_setup` conda env** — no virtualenv is created and nothing is
installed unless you ask. Each deploy verifies the env can import the application and stops with the exact
missing module if not. `bash deploy/deploy.sh --install-deps` installs `Server/requirements.txt` into that
conda env (note: if other services share it, they get those versions too). `CONDA_ENV=/path/to/env` or
`CONDA_ENV=other_name` selects a different environment.

`APP_DIR` defaults to the checkout the script lives in, so nothing is copied elsewhere. Override it
(`sudo APP_DIR=/srv/portfolio bash deploy/deploy.sh`) to sync the code to a different directory instead,
and `CONDA_ENV=/root/miniconda3` to run against a conda installation's base environment.

Afterwards: `lsc status` · `lsc logs` · `lsc update` · `lsc build` · `lsc backup` · `lsc cert` · `lsc env` · `lsc where`.
The `lsc` command reads `/etc/lscblack-portfolio.conf`, so it works from any directory.

**The database is created automatically.** `prestart.py` runs before every service start (and inside
`deploy.sh`): it waits for PostgreSQL, creates the database if it is missing, creates any new tables and
columns, and seeds the default content plus the administrator account — all idempotent, so restarts and
redeploys are safe. A dedicated role (`DB_USER=lscblack`) is created by `deploy.sh` with `LOGIN CREATEDB`
if it does not exist yet.

What `deploy.sh` does, in order: place the code (in place by default) → force production values into
`.env` (APP_ENV, CORS, HTTPS, media URL, generated `JWT_SECRET`/`DATA_ENCRYPTION_KEY`, cleared captcha and
OTP bypass) → ensure the database role → install Python deps into the `fastapi_setup` conda env → run
`prestart.py` → write and start `lscblack-api.service` (gunicorn + uvicorn workers on a private port) →
build the SPA → render the nginx sites (`www` → apex, `/api` and `/uploads` proxied same-origin) → request
Let's Encrypt certificates. Only this project's service and site files are touched; nginx is reloaded,
never restarted.

Safety rails: it refuses to start without a reviewed `.env.production`, refuses placeholder or short
database passwords, never changes the password of an **existing** database role (which other apps on the
server may share) unless you pass `--set-db-password`, and never installs or upgrades Python packages
unless you pass `--install-deps`.

**PostgreSQL only.** SQLite is not supported: a `sqlite://` URL is rejected at startup rather than
silently creating a throwaway file database.

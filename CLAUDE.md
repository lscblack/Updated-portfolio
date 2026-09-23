# Project notes

- Frontend in `Clients/` (pnpm, Vite 8, Tailwind 4, framer-motion 12, React Compiler via babel preset).
  Typecheck with `npx tsc -b`; lint with `npx eslint .` — `react-hooks/refs` violations are real bugs under
  the compiler, `set-state-in-effect` is a warning.
- Backend in `Server/` runs in the conda env `fastapi_setup` (`/home/lscblack/miniconda3/envs/fastapi_setup/bin`)
  locally and in production — conda only, never a virtualenv. `deploy.sh` verifies that env on every run and
  installs into it only with `--install-deps`.
- PostgreSQL only; SQLite is rejected at startup. One database (`lscblack_portfolio`, 17 tables); the
  `postgres` maintenance DB is opened briefly at startup to create it, and Redis is an optional cache.
  `requirements.txt` uses version *ranges* — validate changes with a clean install, not just the dev env
  (sqlmodel >=0.0.25 needs pydantic >=2.11, and newer SQLModel stores `TIMESTAMP WITH TIME ZONE`, so all
  model timestamps must use the aware `app/models/base.py:utcnow`).
  Local dev uses port 8020 (8000 belongs to another project). PostgreSQL on 127.0.0.1, database `lscblack_portfolio`.
- Never cache single-use endpoints. `Cache-Control: public` on all of `/api/public/*` made the browser reuse
  one captcha id, so the second contact/offer submission always failed. Only `/api/public/site` is cached.
- Uploaded files are served with `X-Frame-Options: DENY` by default, which blocks the resume `<object>`;
  `/uploads/*` gets `frame-ancestors 'self' <frontend origins>` instead, and the viewer rewrites the URL to
  the same-origin `/uploads/...` path (nginx and Vite both proxy it) so CSP never blocks it.
- An `<object>`/`<iframe>` has an intrinsic 150px height: `h-full` inside a flex parent collapses it —
  position it `absolute inset-0` instead.
- `position: sticky` breaks if ANY ancestor has `overflow: hidden/clip` (this bit the Interests panel via
  `html { overflow-x: clip }` and the Life panel via a section's `overflow-hidden`). Sticky columns also need
  the grid row to stretch — never put `items-start` on a grid containing one.
- Animate SVG *transforms* (scaleX/scaleY with `transformBox: fill-box`), not width/height attributes:
  framer-motion resolves attribute keyframes before first paint and the browser rejects `width="undefined"`.
- Analytics (`app/models/analytics.py`, `Clients/src/lib/analytics.ts`) is cookie-free: hashed device id,
  no IPs, bots/DNT/admin excluded. The tracker is a module-level singleton — a per-call one would open two
  sessions under React StrictMode. Charts follow the dataviz skill: validated categorical palette in
  `.viz` (index.css), one axis, legend + hover.
- Theme, fonts and all content live in the database (`site_settings`, `about_content`, collections); never
  hardcode content in components — read it from `useSite()`.
- Deploy with `deploy/deploy.sh` (domains lscblack.tech / www / api.lscblack.tech, service `lscblack-api`, CLI `lsc`).
  It deploys in place (`APP_DIR` defaults to the checkout; on the server that is `/var/www/Updated-portfolio`),
  requires a reviewed `Server/.env.production`, and never rewrites an existing database role's password.
- Brand colour is petrol (`#0B5C7F`) with `#4FB3D9` secondary (set by the user on 2026-09-22; it replaced the
  earlier ember orange). Use `text-accent-ink` for accent text so a dark accent stays readable in dark mode.
  The journey scene stays dark throughout — no bright teal/blue-green skies. No emojis in the UI; use lucide icons.

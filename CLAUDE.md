# Project notes

- Frontend in `Clients/` (pnpm, Vite 8, Tailwind 4, framer-motion 12, React Compiler via babel preset).
  Typecheck with `npx tsc -b`; lint with `npx eslint .` — `react-hooks/refs` violations are real bugs under
  the compiler, `set-state-in-effect` is a warning.
- Backend in `Server/` runs in the conda env `fastapi_setup` (`/home/lscblack/miniconda3/envs/fastapi_setup/bin`)
  locally and in production. `deploy.sh` only *verifies* that env (it never installs); `--install-deps`
  installs into a dedicated `.venv`, `--install-deps --shared-env` into the conda env itself.
  `requirements.txt` uses version *ranges* — validate changes with a clean install, not just the dev env
  (sqlmodel >=0.0.25 needs pydantic >=2.11, and newer SQLModel stores `TIMESTAMP WITH TIME ZONE`, so all
  model timestamps must use the aware `app/models/base.py:utcnow`).
  Local dev uses port 8020 (8000 belongs to another project). PostgreSQL on 127.0.0.1, database `lscblack_portfolio`.
- Theme, fonts and all content live in the database (`site_settings`, `about_content`, collections); never
  hardcode content in components — read it from `useSite()`.
- Deploy with `deploy/deploy.sh` (domains lscblack.tech / www / api.lscblack.tech, service `lscblack-api`, CLI `lsc`).
  It deploys in place (`APP_DIR` defaults to the checkout; on the server that is `/var/www/Updated-portfolio`),
  requires a reviewed `Server/.env.production`, and never rewrites an existing database role's password.
- Brand colour is petrol (`#0B5C7F`) with `#4FB3D9` secondary (set by the user on 2026-09-22; it replaced the
  earlier ember orange). Use `text-accent-ink` for accent text so a dark accent stays readable in dark mode.
  The journey scene stays dark throughout — no bright teal/blue-green skies. No emojis in the UI; use lucide icons.

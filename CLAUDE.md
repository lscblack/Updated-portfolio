# Project notes

- Frontend in `Clients/` (pnpm, Vite 8, Tailwind 4, framer-motion 12, React Compiler via babel preset).
  Typecheck with `npx tsc -b`; lint with `npx eslint .` — `react-hooks/refs` violations are real bugs under
  the compiler, `set-state-in-effect` is a warning.
- Backend in `Server/` runs in the conda env `fastapi_setup` (`/home/lscblack/miniconda3/envs/fastapi_setup/bin`).
  Local dev uses port 8020 (8000 belongs to another project). PostgreSQL on 127.0.0.1, database `lscblack_portfolio`.
- Theme, fonts and all content live in the database (`site_settings`, `about_content`, collections); never
  hardcode content in components — read it from `useSite()`.
- Brand colour is ember orange (`#F0631C`), never blue. No emojis anywhere in the UI; use lucide icons.
- Deploy with `deploy/deploy.sh` (domains lscblack.tech / www / api.lscblack.tech, service `lscblack-api`, CLI `lsc`).

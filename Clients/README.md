# Portfolio web app

React 19 · Vite 8 · Tailwind 4 · Framer Motion 12. See the root README for the full picture.

```
src/lib/theme.ts       presets + applyTheme() → CSS variables (--accent, --d-*/--l-* tones, --radius)
src/lib/fonts.ts       curated Google Fonts + applyFonts()
src/lib/icons.tsx      curated lucide icon map (names stored in the database)
src/lib/crypto.ts      browser half of the encrypted payload envelope
src/api/client.ts      axios: bearer token, envelope, same-origin base URL
src/contexts/          ThemeContext (mode + site theme), AuthContext (2-step login), SiteContext (bootstrap data)
src/components/        public sections — Journey.tsx is the scroll-driven walking scene (Story.tsx = walker)
src/pages/Admin/       dashboard; collections.ts drives the generic editor in AdminCollection.tsx
```

`pnpm dev` (port 5180, proxies `/api` and `/uploads` to 127.0.0.1:8020) · `pnpm build` · `pnpm lint`.

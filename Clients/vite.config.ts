import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    port: Number(process.env.PORT) || 5180,
    strictPort: false,
    // set VITE_POLL=1 when the OS inotify watch limit is exhausted (EMFILE)
    watch: process.env.VITE_POLL ? { usePolling: true, interval: 800 } : undefined,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8020', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:8020', changeOrigin: true },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
})

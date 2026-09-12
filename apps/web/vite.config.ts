/// <reference types="vitest/config" />
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Mientras MSW haga de "backend" (Fase 0), el service worker de PWA no debe registrarse:
  // los dos compiten por el mismo scope ('/') y el ganador de esa carrera puede dejar
  // /api/* sin interceptar tras una actualización. Se reactiva solo al apagar los mocks.
  const mocksEnabled = env.VITE_ENABLE_MOCKS !== 'false'
  // Permite construir para un subpath (ej. www.meperdi.com/demo/) sin tocar el resto
  // de la config: VITE_BASE_PATH=/demo/ npm run build -w apps/web. Por defecto, raíz.
  const basePath = env.VITE_BASE_PATH || '/'

  return {
    base: basePath,
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: mocksEnabled ? false : 'auto',
        includeAssets: ['favicon.svg', 'robots.txt'],
        manifest: {
          name: 'ME PERDÍ',
          short_name: 'ME PERDÍ',
          description: 'Lo que se pierde, puede volver.',
          theme_color: '#0B1026',
          background_color: '#FFF8ED',
          display: 'standalone',
          // Rutas relativas (sin "/" inicial): así el manifest funciona igual en la
          // raíz del dominio o en un subpath como /demo/.
          start_url: '.',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },
  }
})

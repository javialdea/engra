import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      workbox: {
        // Las tipografías (solo latín) se guardan para que la app se vea igual sin conexión.
        // Los iconos grandes solo hacen falta al instalar: no se precargan en cada visita.
        globIgnores: ['**/icon-512.png', '**/icon-maskable-512.png'],
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}', '**/*latin-wght-normal*.woff2', '**/*latin-400-italic*.woff2'],
      },
      manifest: {
        name: 'Engra',
        short_name: 'Engra',
        description: 'Tu banquera de bolsillo: gastos, presupuestos y ahorro.',
        theme_color: '#04100b',
        background_color: '#04100b',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        lang: 'es',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})

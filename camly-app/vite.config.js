import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'saas-logo.webp'],
      manifest: {
        name: 'Camly SaaS',
        short_name: 'Camly',
        description: 'Vende por WhatsApp en segundos.',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'saas-logo.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'saas-logo.webp',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    open: true,
  },
})

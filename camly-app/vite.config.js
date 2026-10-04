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
      includeAssets: ['favicon.ico', 'favicon.png', 'icono.png', 'og-image.png'],
      manifest: {
        name: 'NEGU',
        short_name: 'NEGU',
        description: 'Gestión para tu negocio con menú digital y pedidos por WhatsApp.',
        theme_color: '#0284C7',
        background_color: '#090D16',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icono.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icono.png',
            sizes: '512x512',
            type: 'image/png'
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

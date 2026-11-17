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
      devOptions: {
        enabled: false,
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
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
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@supabase/supabase-js',
      'lucide-react',
      'qrcode',
      'leaflet',
      'react-leaflet',
      'recharts',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})

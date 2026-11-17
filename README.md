# NEGU — Plataforma SaaS Multi-Tenant de Catálogos Digitales y Pedidos

Aplicación web principal de **NEGU** ubicada en [`camly-app/`](./camly-app), construida con React 19, Vite, Tailwind CSS v4, Zustand y Supabase.

## Stack Tecnológico

- **Frontend:** React 19, Vite 8 (`vite-plugin-pwa`), React Router, Tailwind CSS v4, Zustand, Leaflet, Recharts, Lucide Icons.
- **Backend y Base de Datos:** Supabase (PostgreSQL, Auth, Storage, RPC, Realtime y políticas RLS en [`camly-app/supabase/schema.sql`](./camly-app/supabase/schema.sql)).
- **Despliegue:** Netlify ([`netlify.toml`](./netlify.toml)).

## Estructura del Proyecto

- `camly-app/src/features/marketing`: página principal y rutas SEO públicas.
- `camly-app/src/features/auth`: registro de negocios, inicio de sesión, verificación y recuperación de contraseña.
- `camly-app/src/features/store`: catálogo público por slug (`/:slug`), tarjetas de producto, carrito con domicilio/recogida y seguimiento en vivo (`/tracking/:id`).
- `camly-app/src/features/admin`: dashboard, pedidos en vivo, comandero de mesas, productos, categorías, domiciliarios, ingresos y configuración.
- `camly-app/src/lib` y `camly-app/src/services`: cliente de Supabase, impresión térmica Bluetooth, utilidades y servicio de pedidos.
- `camly-app/ESPECIFICACION.md` y `camly-app/PROJECT_SPEC.md`: documentación técnica del sistema.

## Comandos de Desarrollo

Ejecuta los comandos dentro de `camly-app/`:

```bash
cd camly-app
npm install --legacy-peer-deps
npm run dev
npm run lint
npm run build
```

## Variables de Entorno

Define en `camly-app/.env.local` (o en las variables del entorno de Netlify):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PRODUCT_BUCKET` (opcional, por defecto `product-images`)

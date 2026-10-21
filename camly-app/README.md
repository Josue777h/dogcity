# NEGU

Aplicación web de NEGU construida con React, Vite, Tailwind CSS y Supabase. La SPA integra páginas públicas, catálogos multi-tenant, autenticación, panel de administración, gestión de pedidos y seguimiento del cliente.

## Requisitos

- Node.js compatible con Vite 8.
- Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local`.
- Esquema de base de datos aplicado desde [`supabase/schema.sql`](./supabase/schema.sql).

## Desarrollo y publicación

```bash
npm install
npm run dev
npm run lint
npm run build
```

Netlify ejecuta el build definido en el `netlify.toml` de la raíz del repositorio y publica el directorio `dist` generado.

## Organización

- `src/features/marketing`: página principal y páginas informativas.
- `src/features/auth`: registro e inicio de sesión.
- `src/features/admin`: panel y operaciones del comercio.
- `src/features/store`: catálogo público y seguimiento de pedidos.
- `src/lib` y `src/services`: acceso a Supabase y lógica compartida.
- `supabase/schema.sql`: instalación completa y reejecutable del esquema.

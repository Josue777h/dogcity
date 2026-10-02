# Base de Datos — CAMLY SaaS

Archivo único de inicialización y estructura completa de la base de datos para Supabase.

## Archivo Principal

- [`schema.sql`](file:///c:/Users/josue/Documents/ventas/camly-app/supabase/schema.sql): Script único DDL que crea y configura toda la base de datos en limpio (sin datos de prueba).

## Tablas del Sistema

| Tabla | Descripción |
|---|---|
| `negocios` | Perfiles de restaurantes/negocios (slug único, colores de marca, WhatsApp, pagos, coordenadas GPS) |
| `categorias` | Categorías de productos por negocio con restricción única |
| `productos` | Catálogo de productos con imágenes, precios, descripción y disponibilidad |
| `domiciliarios` | Repartidores asignados por negocio |
| `suscripciones` | Planes SaaS (Trial 7 días / Pro activo) vinculados al negocio |
| `pedidos` | Historial de pedidos con items JSON, estados, tokens de tracking, coordenadas y método de entrega |

## Cómo ejecutar

1. Abre tu proyecto en el **[Dashboard de Supabase](https://supabase.com/dashboard)**.
2. Ve a **SQL Editor** en el menú lateral.
3. Haz clic en **New query**.
4. Copia y pega el contenido completo de [`schema.sql`](file:///c:/Users/josue/Documents/ventas/camly-app/supabase/schema.sql).
5. Haz clic en **Run** (o presiona `Ctrl + Enter`).

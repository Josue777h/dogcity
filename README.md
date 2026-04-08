# Sistema de Pedidos para Restaurante

Aplicación web de pedidos por WhatsApp para restaurante, conectada 100% con Supabase.

## Tecnologías

- Frontend: HTML, CSS y JavaScript puro
- Base de datos online: Supabase (tabla `productos`)
- Cliente de datos: `@supabase/supabase-js` desde CDN

## Archivos principales

- `index.html`: tienda para clientes
- `admin.html`: panel para el dueño del restaurante
- `app.js`: lógica de frontend para tienda y admin
- `styles.css`: estilos de la aplicación

## Configuración Supabase

En `index.html` y `admin.html` define:

```html
<script>
  window.SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
  window.SUPABASE_ANON_KEY = "TU_ANON_KEY";
</script>
```

La tabla `productos` debe tener al menos estas columnas:

- `id` (integer o bigint, PK)
- `name` (text)
- `price` (numeric/int)
- `description` (text)
- `unit` (text)
- `image` (text)

## Autenticación Admin

El panel `admin.html` ahora usa `Supabase Auth` con correo y contraseña.

Recomendado:

1. Crea un usuario administrador en `Authentication > Users`
2. Inicia sesión en `admin.html` con ese correo y contraseña
3. Protege la tabla `productos` con RLS

SQL sugerido en Supabase:

```sql
alter table public.productos enable row level security;

create policy "Productos visibles para todos"
on public.productos
for select
to anon, authenticated
using (true);

create policy "Solo admin autenticado puede insertar"
on public.productos
for insert
to authenticated
with check (true);

create policy "Solo admin autenticado puede actualizar"
on public.productos
for update
to authenticated
using (true)
with check (true);

create policy "Solo admin autenticado puede eliminar"
on public.productos
for delete
to authenticated
using (true);
```

Si quieres seguridad más fuerte, el siguiente paso es restringir por email o por rol, no solo por `authenticated`.

## Cómo ejecutar

No necesitas Flask ni backend local.

1. Abre `index.html` para la tienda
2. Abre `admin.html` para el panel admin
3. Inicia sesión con tu usuario admin de Supabase
4. Verifica que puedes crear/editar/eliminar productos en Supabase

## Funcionalidades

- Cliente:
  - consulta productos desde Supabase
  - selecciona cantidades y genera pedido por WhatsApp
  - incluye comentarios y ubicación en el mensaje
- Admin:
  - crear productos
  - actualizar productos
  - eliminar productos
  - sembrar automáticamente el menú base de DogCity si la tabla `productos` está vacía

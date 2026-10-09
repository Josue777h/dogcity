# Base de datos NEGU

La configuración completa de Supabase está en **un único archivo**: [`schema.sql`](./schema.sql).

Incluye las tablas que usa la aplicación (`negocios`, `categorias`, `productos`, `domiciliarios`, `suscripciones` y `pedidos`), seguridad RLS, estados de pedido, cotización de domicilio, RPC de seguimiento y cancelación con ventana de 60 segundos, Storage de imágenes y comprobantes, e integración con Realtime.

## Aplicarlo en Supabase

1. Abre **Supabase Dashboard → SQL Editor → New query**.
2. Copia el contenido completo de `supabase/schema.sql` y ejecútalo.

Es reejecutable y no elimina tablas ni datos existentes. Para cualquier instalación nueva o existente, este es el único SQL que debes ejecutar desde el proyecto. Si el seguimiento informa que falta una función, vuelve a ejecutar este mismo archivo para que PostgREST recargue el esquema.

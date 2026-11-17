---
name: negu-supabase-security
description: >-
  Esquema PostgreSQL, aislamiento multi-tenant (RLS), funciones RPC SECURITY DEFINER, Storage y reglas de integridad financiera y de suscripciones en NEGU.
  Activa esta skill al tocar camly-app/supabase/schema.sql, camly-app/src/lib/supabase.js, camly-app/src/services/orderService.ts, BillingModal, AuthGuard o cualquier política RLS / cálculo de precios.
---

# NEGU — Supabase Schema, RLS & Security

Usa esta skill junto con `camly` en cualquier cambio de base de datos, autenticación, pedidos,Storage o suscripciones.

## 1. Archivos fuente de verdad

- Esquema, triggers, RLS, RPCs y Storage: [schema.sql](file:///c:/Users/josue/Documents/dogcity/camly-app/supabase/schema.sql)
- Cliente Supabase, detección adaptativa de esquema (`PRODUCT_SCHEMA_VARIANTS`) y CRUD: [supabase.js](file:///c:/Users/josue/Documents/dogcity/camly-app/src/lib/supabase.js)
- Operaciones del cliente sobre pedidos y comprobantes: [orderService.ts](file:///c:/Users/josue/Documents/dogcity/camly-app/src/services/orderService.ts)
- Protección de rutas admin: [AuthGuard.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/auth/AuthGuard.jsx)
- Suscripción en store cliente (`isPro`, `isExpired`): [stores/index.js](file:///c:/Users/josue/Documents/dogcity/camly-app/src/stores/index.js)

## 2. Tablas, triggers y RPCs actuales

### Tablas principales (`public`)
- `negocios` (`user_id` -> `auth.users`, `nombre` UNIQUE slug, `business_type`, `horario` jsonb, `catalog_design` jsonb, tarifas domicilio).
- `categorias` (`negocio_id`, `UNIQUE (negocio_id, nombre)`).
- `productos` (`negocio_id`, `categoria_id`, `precio`, `descripcion` con `<!--NEGU_OPTIONS:...-->`).
- `domiciliarios` (`negocio_id`, `nombre`, `telefono`, `activo`).
- `suscripciones` (`negocio_id` UNIQUE, `plan`, `estado`, `es_trial`, `fecha_fin`). **Solo el servidor/RPCs modifican esta tabla** (`REVOKE INSERT, UPDATE, DELETE` a `anon, authenticated`).
- `pedidos` (`negocio_id`, `token`, `status`/`estado`, `items`/`productos`, `subtotal_amount`, `delivery_fee`, `total_amount`, `payment_receipt_url`, `confirmed_at`).

### Triggers y RPCs críticos
- `trg_sync_pedido_status`: sincroniza bidireccionalmente `status`/`estado` e `items`/`productos`.
- `trg_guard_customer_cancel`: impide que un cliente cancele fuera de `COTIZACION_ENVIADA` o pasados `60s` de `CONFIRMADO_GRACIA`.
- RPCs `SECURITY DEFINER` (`anon, authenticated`): `customer_create_order`, `customer_get_order`, `customer_accept_quote`, `customer_cancel_order`, `advance_grace_to_preparation`, `customer_save_receipt`, `receipt_path_authorized`.
- RPCs `authenticated`: `create_trial_subscription`, `mark_subscription_expired`.

## 3. Reglas estrictas de seguridad e integridad

1. **Aislamiento de tenant**:
   - Toda consulta y mutación administrativa debe ir filtrada por `negocio_id` perteneciente al usuario dueño (`n.user_id = auth.uid()` en RLS) y mantener el filtro en el query cliente cuando aplique.
   - Nunca desactivar RLS ni exponer `service_role` en el frontend.
2. **Columnas públicas vs privadas en `negocios`**:
   - `anon` solo tiene `GRANT SELECT (id, nombre, ..., timezone)` en columnas públicas. No agregar `user_id` u otros datos sensibles al listado público.
3. **Storage (`product-images` vs `receipts`)**:
   - `receipts` es privado y restringido por `receipt_path_authorized(order_id, token)`. Validar MIME (`jpeg`, `png`, `webp`, `pdf`) y tamaño `<= 10 MB`.
   - Precaución actual conocida: `product-images` tiene política `FOR ALL` abierta en `schema.sql` líneas 298–299; cualquier endurecimiento futuro debe limitar escritura/borrado al dueño autenticado sin romper rutas existentes.
4. **Integridad de precios y suscripciones**:
   - Nunca confiar en totales calculados únicamente en el navegador cuando se evolucione `customer_create_order`: los precios reales deben validarse contra `public.productos` en base de datos.
   - Toda operación administrativa importante (`create`, `update`, `delete`) debe comprobar si existe restricción por suscripción vencida también del lado del servidor cuando se active el cobro obligatorio.

## 4. Checklist ante cualquier cambio SQL

1. Verificar que `schema.sql` siga siendo **idempotente** (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `CREATE OR REPLACE FUNCTION`).
2. Comprobar que toda función `SECURITY DEFINER` incluya `SET search_path = public, pg_temp` y su `REVOKE ALL ... FROM PUBLIC` + `GRANT EXECUTE` mínimo necesario.
3. Confirmar compatibilidad con `PUBLIC_BUSINESS_FIELDS` / `LEGACY_PUBLIC_BUSINESS_FIELDS` en `supabase.js`.

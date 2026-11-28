
# Supabase — Orden de Ejecución (NEGU)

Ejecuta los scripts en **Supabase Dashboard → SQL Editor** en este orden exacto (todos son idempotentes):

1. **Instalación base (solo proyectos nuevos):**
   - `schema.sql`
2. **Migraciones incrementales (`migrations/`):**
   1. `migrations/01_subscription_integrity.sql` — Bloquea escritura directa de `suscripciones` (solo RPC).
   2. `migrations/02_quote_shipping_flow.sql` — `business_type`, columnas de cotización y RPC `cancel_order_customer`.
   3. `migrations/03_quote_flow_hardening.sql` — Cierra lectura anónima masiva de `pedidos` y fija gracia de 60s.
   4. `migrations/04_secure_order_pricing.sql` — Trigger `BEFORE INSERT` que valida y recalcula totales en servidor.
   5. `migrations/05_catalog_inventory_columns.sql` — Columnas nativas `compare_price`, `stock` y `catalog_design`.
3. **Plantillas de correo (`Authentication → Email Templates`):**
   - `templates/confirm-signup.html` → Confirm signup
   - `templates/recovery.html` → Reset password
   - `templates/password-changed.html` → Security notifications · Password changed

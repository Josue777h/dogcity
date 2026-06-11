# Seed de Base de Datos — CAMLY

Scripts para poblar las 6 tablas con datos completos de demo.

## Estado actual (después del seed automático)

| Tabla | Contenido |
|-------|-----------|
| `negocios` | 2 negocios con perfil completo (dirección, redes, pagos, GPS, logo) |
| `categorias` | 10 categorías (5 por negocio) |
| `productos` | 22 productos nuevos + datos legacy |
| `pedidos` | ~25 pedidos por negocio con items, estados, domicilio, pagos |
| `suscripciones` | Pizza Liberty (activo) + Imperio del Postre (trial 7 días) |
| `domiciliarios` | ⚠️ Requiere SQL manual (RLS bloquea inserts desde la app) |

## Negocios configurados

1. **Pizza Liberty** — `/pizzaliberty` — Pizzería con 12 productos, domicilio automático
2. **Imperio del Postre** — `/imperiodelpostre` — Postres con 10 productos, domicilio fijo $4.500

## Cómo ejecutar

### Opción A — Scripts Node (recomendado para la mayoría)

```bash
cd camly-app
node scripts/seed-database.mjs   # negocios, categorías, productos
node scripts/seed-pedidos.mjs    # pedidos de ejemplo
```

### Opción B — SQL en Supabase Dashboard

Para **domiciliarios** (y re-ejecutar todo de forma idempotente):

1. Abre [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor**
2. Pega y ejecuta el contenido de `supabase/seed-completo.sql`

O solo domiciliarios:

```bash
# Ejecutar supabase/seed-domiciliarios.sql en SQL Editor
```

## Archivos

- `scripts/seed-database.mjs` — Seed principal (negocios, categorías, productos)
- `scripts/seed-pedidos.mjs` — Pedidos con datos realistas
- `supabase/seed-completo.sql` — SQL idempotente para las 6 tablas
- `scripts/inspect-db.mjs` — Inspeccionar columnas y conteos

## Notas

- Los scripts son **idempotentes**: no duplican productos/categorías si ya existen
- Los pedidos incluyen: `items` (JSON), estados variados, método de entrega, pago, GPS, tokens de tracking
- Algunos productos están marcados como `disponible: false` para probar el badge "Agotado"

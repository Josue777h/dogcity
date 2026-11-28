-- Paso 05: Columnas nativas de inventario, precio anterior y diseño/módulos del catálogo
ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS compare_price NUMERIC,
  ADD COLUMN IF NOT EXISTS stock INTEGER;

ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS catalog_design JSONB DEFAULT '{}'::jsonb;

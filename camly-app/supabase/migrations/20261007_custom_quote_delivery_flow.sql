-- ============================================================================
-- NEGU SAAS - SCRIPT SQL UNIFICADO: FLUJO DE ENTREGA POR COTIZAR MULTI-RUBRO
-- PostgreSQL + Supabase (RLS, Enums, Constraints, RPC Atómico, Storage)
-- ============================================================================

-- 1. TIPO ENUM Y COMPATIBILIDAD DE ESTADOS
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'COTIZACION_PENDIENTE',
    'COTIZACION_ENVIADA',
    'CONFIRMADO_GRACIA',
    'EN_PREPARACION',
    'EN_CAMINO',
    'ENTREGADO',
    'CANCELADO'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TIPO DE NEGOCIO / RUBRO COMERCIAL (business_type)
-- Rubros soportados: 'food', 'retail', 'pharmacy', 'stationery', 'general'
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'negocios') THEN
    ALTER TABLE public.negocios 
      ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'general';
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stores') THEN
    ALTER TABLE public.stores 
      ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'general';
  END IF;
END $$;

-- 3. EXTENSIÓN Y COMPATIBILIDAD DE TABLA PEDIDOS (u ORDERS)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pedidos') THEN
    ALTER TABLE public.pedidos 
      ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'nuevo' NOT NULL,
      ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50) DEFAULT 'fixed' NOT NULL,
      ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12, 2) DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL,
      ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20) NULL,
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash' NOT NULL,
      ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT NULL,
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'pending' NOT NULL;

    -- Sincronizar montos retroactivos si total_amount viene en cero
    UPDATE public.pedidos 
    SET 
      delivery_fee = COALESCE(domicilio_costo, 0),
      total_amount = COALESCE(total, 0),
      subtotal_amount = GREATEST(COALESCE(total, 0) - COALESCE(domicilio_costo, 0), 0)
    WHERE (total_amount = 0 OR total_amount IS NULL) AND total > 0;

    CREATE INDEX IF NOT EXISTS idx_pedidos_status ON public.pedidos(status);
    CREATE INDEX IF NOT EXISTS idx_pedidos_delivery_type ON public.pedidos(delivery_type);
    CREATE INDEX IF NOT EXISTS idx_pedidos_token ON public.pedidos(token);
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    ALTER TABLE public.orders 
      ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'nuevo' NOT NULL,
      ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50) DEFAULT 'fixed' NOT NULL,
      ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12, 2) DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL,
      ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20) NULL,
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash' NOT NULL,
      ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT NULL,
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'pending' NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- 4. PROCEDIMIENTOS RPC ATÓMICOS PARA BLINDAJE DE NEGOCIO
-- ============================================================================

-- A. Cliente acepta cotización e inicia ventana de gracia (60s)
CREATE OR REPLACE FUNCTION public.customer_accept_quote(p_order_id BIGINT, p_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.pedidos%ROWTYPE;
BEGIN
  -- Bloqueo FOR UPDATE para evitar condiciones de carrera (doble toque concurrente)
  SELECT * INTO v_order 
  FROM public.pedidos 
  WHERE id = p_order_id AND token = p_token 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden no encontrada o token de seguridad inválido.';
  END IF;

  -- Regla de Negocio: Solo puede aceptarse si está en COTIZACION_ENVIADA
  IF v_order.status <> 'COTIZACION_ENVIADA' AND v_order.estado <> 'COTIZACION_ENVIADA' THEN
    RAISE EXCEPTION 'La orden no se encuentra en estado de cotización enviada (Estado actual: %).', v_order.status;
  END IF;

  UPDATE public.pedidos
  SET 
    status = 'CONFIRMADO_GRACIA',
    estado = 'CONFIRMADO_GRACIA',
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'status', 'CONFIRMADO_GRACIA', 'confirmed_at', NOW());
END;
$$;

-- B. Transición de gracia a preparación/empaque (después de 60s)
CREATE OR REPLACE FUNCTION public.advance_grace_to_kitchen(p_order_id BIGINT, p_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.pedidos%ROWTYPE;
BEGIN
  SELECT * INTO v_order 
  FROM public.pedidos 
  WHERE id = p_order_id AND token = p_token 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden no encontrada o token inválido.';
  END IF;

  IF v_order.status = 'CONFIRMADO_GRACIA' OR v_order.estado = 'CONFIRMADO_GRACIA' THEN
    UPDATE public.pedidos
    SET 
      status = 'EN_PREPARACION',
      estado = 'preparando',
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'status', 'EN_PREPARACION');
  END IF;

  RETURN jsonb_build_object('success', false, 'message', 'La orden ya no está en ventana de gracia');
END;
$$;

-- C. Cancelación por el cliente (Blindaje: Bloqueado una vez entre a preparación/empaque)
CREATE OR REPLACE FUNCTION public.customer_cancel_order(
  p_order_id BIGINT, 
  p_token TEXT,
  p_reason TEXT DEFAULT 'Cancelado por el cliente'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.pedidos%ROWTYPE;
BEGIN
  SELECT * INTO v_order 
  FROM public.pedidos 
  WHERE id = p_order_id AND token = p_token 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden no encontrada o token inválido.';
  END IF;

  -- Regla estricta: Rechazar si ya entró a preparación o despacho
  IF v_order.status NOT IN ('COTIZACION_PENDIENTE', 'COTIZACION_ENVIADA', 'CONFIRMADO_GRACIA', 'nuevo') 
     AND v_order.estado NOT IN ('COTIZACION_PENDIENTE', 'COTIZACION_ENVIADA', 'CONFIRMADO_GRACIA', 'nuevo') THEN
    RAISE EXCEPTION 'No es posible cancelar: la orden ya se encuentra en preparación o en camino.';
  END IF;

  UPDATE public.pedidos
  SET 
    status = 'CANCELADO',
    estado = 'cancelado',
    cancelled_by = 'customer',
    cancellation_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'status', 'CANCELADO');
END;
$$;

-- ============================================================================
-- 5. BUCKET DE STORAGE Y POLÍTICAS RLS PARA COMPROBANTES DE TRANSFERENCIA
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas idempotentes (eliminan versiones previas para no generar error al reejecutar)
DROP POLICY IF EXISTS "Public Receipt Upload" ON storage.objects;
CREATE POLICY "Public Receipt Upload" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'receipts');

-- Corrección PostgreSQL 42601: SELECT requiere USING, no WITH CHECK
DROP POLICY IF EXISTS "Public Receipt Read" ON storage.objects;
CREATE POLICY "Public Receipt Read" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'receipts');

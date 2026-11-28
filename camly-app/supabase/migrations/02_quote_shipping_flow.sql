-- Sistema Multi-Rubro y Flujo de Envío "Por Cotizar / Confirmar"

-- 1. Columna business_type en negocios (food, retail, pharmacy, stationery, general)
ALTER TABLE public.negocios
  ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'general';

-- 2. Columnas de cotización, confirmación y cancelación en pedidos
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(40) DEFAULT 'domicilio',
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(30),
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 3. RPC cancel_order_customer: solo permite cancelar en COTIZACION_ENVIADA o CONFIRMADO_GRACIA (ventana 60s)
CREATE OR REPLACE FUNCTION public.cancel_order_customer(
  p_order_id BIGINT,
  p_token TEXT,
  p_reason TEXT DEFAULT 'Cancelado por el cliente'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.pedidos%ROWTYPE;
BEGIN
  SELECT * INTO v_order
  FROM public.pedidos
  WHERE id = p_order_id AND token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido o token inválido';
  END IF;

  IF coalesce(v_order.status, v_order.estado) NOT IN ('COTIZACION_ENVIADA', 'CONFIRMADO_GRACIA') THEN
    RAISE EXCEPTION 'El pedido ya pasó a preparación y no puede cancelarse';
  END IF;

  IF coalesce(v_order.status, v_order.estado) = 'CONFIRMADO_GRACIA'
     AND (v_order.confirmed_at IS NULL OR v_order.confirmed_at <= now() - interval '60 seconds') THEN
    RAISE EXCEPTION 'Terminó el tiempo de gracia para deshacer el pedido';
  END IF;

  UPDATE public.pedidos
  SET
    status = 'CANCELADO',
    estado = 'CANCELADO',
    cancelled_by = 'customer',
    cancellation_reason = left(coalesce(p_reason, 'Cancelado por el cliente'), 500),
    updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'status', 'CANCELADO');
END;
$$;

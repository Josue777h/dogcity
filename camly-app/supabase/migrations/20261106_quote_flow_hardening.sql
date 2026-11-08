-- Endurecimiento del flujo Por Cotizar / Confirmar
-- 1) Cierra lectura anónima masiva de pedidos (la política USING (token IS NOT NULL) exponía todos los pedidos).
--    El seguimiento del cliente usa la RPC customer_get_order (SECURITY DEFINER) que exige token.
-- 2) Ventana de gracia de 60 segundos, consistente en trigger, RPC y frontend.

DROP POLICY IF EXISTS "Public select pedidos with token" ON public.pedidos;

CREATE OR REPLACE FUNCTION public.guard_customer_order_cancellation() RETURNS trigger
LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
  IF NEW.cancelled_by='customer' AND NEW.status='CANCELADO' THEN
    IF OLD.status NOT IN ('COTIZACION_ENVIADA','CONFIRMADO_GRACIA') OR OLD.estado NOT IN ('COTIZACION_ENVIADA','CONFIRMADO_GRACIA') THEN
      RAISE EXCEPTION 'El pedido ya no se puede cancelar desde el seguimiento';
    END IF;
    IF OLD.status='CONFIRMADO_GRACIA' AND (OLD.confirmed_at IS NULL OR OLD.confirmed_at <= now()-interval '60 seconds') THEN
      RAISE EXCEPTION 'Terminó el tiempo para deshacer el pedido';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.customer_cancel_order(p_order_id bigint,p_token text,p_reason text DEFAULT 'Cancelado por el cliente') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE o public.pedidos%ROWTYPE;
BEGIN
  SELECT * INTO o FROM public.pedidos WHERE id=p_order_id AND token=p_token FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido o token inválido'; END IF;
  IF o.status NOT IN ('COTIZACION_ENVIADA','CONFIRMADO_GRACIA') OR o.estado NOT IN ('COTIZACION_ENVIADA','CONFIRMADO_GRACIA') THEN RAISE EXCEPTION 'El pedido ya no se puede cancelar desde el seguimiento'; END IF;
  IF o.status='CONFIRMADO_GRACIA' AND (o.confirmed_at IS NULL OR o.confirmed_at<=now()-interval '60 seconds') THEN RAISE EXCEPTION 'Terminó el tiempo para deshacer el pedido'; END IF;
  UPDATE public.pedidos SET status='CANCELADO',estado='CANCELADO',cancelled_by='customer',cancellation_reason=left(coalesce(p_reason,'Cancelado por el cliente'),500),updated_at=now() WHERE id=p_order_id;
  RETURN jsonb_build_object('success',true,'status','CANCELADO');
END $$;

CREATE OR REPLACE FUNCTION public.advance_grace_to_preparation(p_order_id bigint,p_token text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE o public.pedidos%ROWTYPE;
BEGIN
  SELECT * INTO o FROM public.pedidos WHERE id=p_order_id AND token=p_token FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido o token inválido'; END IF;
  IF o.status<>'CONFIRMADO_GRACIA' OR o.estado<>'CONFIRMADO_GRACIA' OR o.confirmed_at IS NULL OR o.confirmed_at>now()-interval '60 seconds' THEN RAISE EXCEPTION 'El período de gracia sigue activo o el pedido cambió'; END IF;
  UPDATE public.pedidos SET status='EN_PREPARACION',estado='EN_PREPARACION',updated_at=now() WHERE id=p_order_id;
  RETURN jsonb_build_object('success',true,'status','EN_PREPARACION');
END $$;

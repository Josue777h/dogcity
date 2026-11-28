-- Blindaje de precios al crear pedidos en public.pedidos
-- Valida que subtotal_amount y total_amount sean > 0 y recalcula total_amount = subtotal_amount + delivery_fee
-- en el servidor si detecta discrepancia desde el navegador.

CREATE OR REPLACE FUNCTION public.enforce_secure_order_pricing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_delivery_type text := lower(coalesce(NEW.delivery_type, NEW.entrega_metodo, ''));
  v_subtotal numeric := coalesce(NEW.subtotal_amount, NEW.total_amount, NEW.total, 0);
  v_delivery numeric := coalesce(NEW.delivery_fee, NEW.domicilio_costo, 0);
  v_expected_total numeric;
BEGIN
  IF v_subtotal <= 0 THEN
    RAISE EXCEPTION 'subtotal_amount debe ser mayor a 0';
  END IF;

  IF v_delivery < 0 THEN
    RAISE EXCEPTION 'delivery_fee no puede ser negativo';
  END IF;

  IF v_delivery_type IN ('por_cotizar', 'manual', 'pickup', 'recogida', 'mesa', 'dine_in') THEN
    v_delivery := coalesce(v_delivery, 0);
  END IF;

  v_expected_total := v_subtotal + v_delivery;

  IF v_expected_total <= 0 THEN
    RAISE EXCEPTION 'total_amount debe ser mayor a 0';
  END IF;

  -- Si hay discrepancia matemática, recalcular automáticamente en el servidor
  NEW.subtotal_amount := v_subtotal;
  NEW.delivery_fee := v_delivery;
  NEW.domicilio_costo := v_delivery;

  IF coalesce(NEW.total_amount, 0) <> v_expected_total OR coalesce(NEW.total, 0) <> v_expected_total THEN
    NEW.total_amount := v_expected_total;
    NEW.total := v_expected_total;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_secure_order_pricing ON public.pedidos;
CREATE TRIGGER trg_secure_order_pricing
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_secure_order_pricing();

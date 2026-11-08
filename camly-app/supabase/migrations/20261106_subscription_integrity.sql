-- Integridad de suscripciones: solo el servidor escribe en `suscripciones`.
-- Antes, el dueño tenía una política FOR ALL y podía activarse PRO a sí mismo.

DROP POLICY IF EXISTS suscripciones_owner_write ON public.suscripciones;
REVOKE INSERT, UPDATE, DELETE ON public.suscripciones FROM anon, authenticated;

-- Crea la prueba inicial de 7 días. No reinicia una suscripción existente.
CREATE OR REPLACE FUNCTION public.create_trial_subscription(p_negocio_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.negocios WHERE id = p_negocio_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Negocio no encontrado o sin permiso';
  END IF;
  INSERT INTO public.suscripciones (negocio_id, plan, estado, es_trial, fecha_inicio, fecha_fin)
  VALUES (p_negocio_id, 'pro', 'trial', true, now(), now() + interval '7 days')
  ON CONFLICT (negocio_id) DO NOTHING;
  RETURN jsonb_build_object('success', true);
END $$;

-- Marca como vencida una suscripción cuya fecha_fin ya pasó.
CREATE OR REPLACE FUNCTION public.mark_subscription_expired(p_negocio_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.suscripciones
     SET estado = 'vencido', es_trial = false, updated_at = now()
   WHERE negocio_id = p_negocio_id
     AND estado IN ('trial', 'activo')
     AND fecha_fin < now()
     AND EXISTS (SELECT 1 FROM public.negocios n WHERE n.id = p_negocio_id AND n.user_id = auth.uid());
END $$;

REVOKE ALL ON FUNCTION public.create_trial_subscription(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_subscription_expired(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_trial_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_subscription_expired(uuid) TO authenticated;

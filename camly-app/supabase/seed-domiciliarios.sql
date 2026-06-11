-- Solo domiciliarios (RLS bloquea insert desde cliente anon)
-- Ejecutar en Supabase Dashboard → SQL Editor

INSERT INTO domiciliarios (negocio_id, nombre, telefono, activo)
SELECT '69a10caa-f581-448d-b5df-d65ea426e2fb', d.nombre, d.telefono, d.activo FROM (VALUES
  ('Carlos Mendoza', '573001234567', true),
  ('Andrés Gómez', '573109876543', true),
  ('Luis Ramírez', '573207654321', false)
) AS d(nombre, telefono, activo)
WHERE NOT EXISTS (
  SELECT 1 FROM domiciliarios dom WHERE dom.negocio_id = '69a10caa-f581-448d-b5df-d65ea426e2fb' AND dom.telefono = d.telefono
);

INSERT INTO domiciliarios (negocio_id, nombre, telefono, activo)
SELECT 'a4dda1ba-74b6-401f-937e-999303c12ca1', d.nombre, d.telefono, d.activo FROM (VALUES
  ('María Fernández', '573154567890', true),
  ('Pedro Sánchez', '573165678901', true)
) AS d(nombre, telefono, activo)
WHERE NOT EXISTS (
  SELECT 1 FROM domiciliarios dom WHERE dom.negocio_id = 'a4dda1ba-74b6-401f-937e-999303c12ca1' AND dom.telefono = d.telefono
);

SELECT COUNT(*) AS domiciliarios FROM domiciliarios;

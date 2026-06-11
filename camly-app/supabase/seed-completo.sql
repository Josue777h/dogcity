-- ═══════════════════════════════════════════════════════════════════════════════
-- CAMLY — Seed completo de base de datos
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
--
-- Enriquece las 6 tablas con datos realistas para demo y desarrollo.
-- Seguro de re-ejecutar: usa ON CONFLICT / WHERE NOT EXISTS donde aplica.
-- ═══════════════════════════════════════════════════════════════════════════════

-- IDs de negocios existentes
-- Pizza Liberty:  69a10caa-f581-448d-b5df-d65ea426e2fb
-- Imperio Postre: a4dda1ba-74b6-401f-937e-999303c12ca1

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. NEGOCIOS — Perfiles completos
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE negocios SET
  nombre_visible = 'Pizza Liberty',
  telefono = '573143243707',
  whatsapp_contacto = '573143243707',
  direccion = 'Av. 0 #10-45, Barrio La Libertad, Cúcuta',
  theme_color = '#EA580C',
  color_secundario = '#FFF7ED',
  instagram = '@pizzaliberty_cuc',
  facebook = 'PizzaLibertyCucuta',
  tiktok = '@pizzaliberty',
  footer_message = 'Las mejores pizzas artesanales de Cúcuta. Horario: Lun-Dom 11am - 11pm',
  pago_banco = 'Nequi / Bancolombia',
  pago_alias = '3143243707',
  metodos_pago = '["efectivo","transferencia"]'::jsonb,
  lat = 7.89391,
  lng = -72.50782,
  tipo_domicilio = 'automatico',
  costo_por_km = 1200,
  domicilio_minimo = 3500,
  precio_domicilio = 0,
  logo_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80'
WHERE id = '69a10caa-f581-448d-b5df-d65ea426e2fb';

UPDATE negocios SET
  nombre_visible = 'Imperio del Postre',
  telefono = '573142185621',
  whatsapp_contacto = '573142185621',
  direccion = 'Calle 12 #5-23, Centro, Cúcuta',
  theme_color = '#DB2777',
  color_secundario = '#FDF2F8',
  instagram = '@imperiodelpostre',
  facebook = 'ImperioDelPostreCuc',
  tiktok = '@imperiodelpostre',
  footer_message = 'Endulzamos tu día con los mejores postres artesanales. Pedidos hasta las 9pm.',
  pago_banco = 'Daviplata / Nequi',
  pago_alias = '3142185621',
  metodos_pago = '["efectivo","transferencia"]'::jsonb,
  lat = 7.8897,
  lng = -72.4968,
  tipo_domicilio = 'fijo',
  costo_por_km = 1000,
  domicilio_minimo = 3000,
  precio_domicilio = 4500,
  logo_url = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&q=80'
WHERE id = 'a4dda1ba-74b6-401f-937e-999303c12ca1';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CATEGORÍAS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO categorias (negocio_id, nombre)
SELECT '69a10caa-f581-448d-b5df-d65ea426e2fb', nombre FROM (VALUES
  ('Pizzas Clásicas'), ('Pizzas Premium'), ('Bebidas'), ('Acompañantes'), ('Promociones')
) AS t(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM categorias c WHERE c.negocio_id = '69a10caa-f581-448d-b5df-d65ea426e2fb' AND c.nombre = t.nombre
);

INSERT INTO categorias (negocio_id, nombre)
SELECT 'a4dda1ba-74b6-401f-937e-999303c12ca1', nombre FROM (VALUES
  ('Tortas'), ('Postres Individuales'), ('Helados'), ('Bebidas Frías'), ('Especiales del Día')
) AS t(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM categorias c WHERE c.negocio_id = 'a4dda1ba-74b6-401f-937e-999303c12ca1' AND c.nombre = t.nombre
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PRODUCTOS — Pizza Liberty
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO productos (negocio_id, nombre, precio, descripcion, imagen, categoria, categoria_id, unidad, disponible)
SELECT
  '69a10caa-f581-448d-b5df-d65ea426e2fb', p.nombre, p.precio, p.descripcion, p.imagen, p.categoria,
  (SELECT id FROM categorias WHERE negocio_id = '69a10caa-f581-448d-b5df-d65ea426e2fb' AND nombre = p.categoria LIMIT 1),
  p.unidad, p.disponible
FROM (VALUES
  ('Pizza Margarita', 28000, 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', 'Pizzas Clásicas', 'unidad', true),
  ('Pizza Pepperoni', 32000, 'Pepperoni premium, queso mozzarella y salsa especial de la casa', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', 'Pizzas Clásicas', 'unidad', true),
  ('Pizza Hawaiana', 30000, 'Jamón, piña caramelizada y extra queso mozzarella', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', 'Pizzas Clásicas', 'unidad', true),
  ('Pizza Cuatro Quesos', 35000, 'Mozzarella, parmesano, gorgonzola y queso crema', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', 'Pizzas Premium', 'unidad', true),
  ('Pizza Liberty Especial', 42000, 'Carne, pollo, champiñones, pimientos y doble queso', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', 'Pizzas Premium', 'unidad', true),
  ('Pizza Vegetariana', 29000, 'Champiñones, pimientos, cebolla, aceitunas y espinaca', 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&q=80', 'Pizzas Premium', 'unidad', false),
  ('Combo Familiar', 75000, '2 pizzas medianas + gaseosa 1.5L + papas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', 'Promociones', 'combo', true),
  ('Papas Liberty', 12000, 'Papas crujientes con queso cheddar y tocino', 'https://images.unsplash.com/photo-1573080496219-bfa03f94544b?w=400&q=80', 'Acompañantes', 'porción', true),
  ('Alitas BBQ x6', 18000, '6 alitas bañadas en salsa BBQ ahumada', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80', 'Acompañantes', 'porción', true),
  ('Gaseosa 1.5L', 7000, 'Coca-Cola, Sprite o Colombiana', 'https://images.unsplash.com/photo-1546173159-315724a3167b?w=400&q=80', 'Bebidas', 'unidad', true),
  ('Limonada Natural', 6000, 'Limonada fresca 500ml', 'https://images.unsplash.com/photo-1546173159-315724a3167b?w=400&q=80', 'Bebidas', 'unidad', true),
  ('Cerveza Águila', 5000, 'Botella 330ml bien fría', 'https://images.unsplash.com/photo-1546173159-315724a3167b?w=400&q=80', 'Bebidas', 'unidad', true)
) AS p(nombre, precio, descripcion, imagen, categoria, unidad, disponible)
WHERE NOT EXISTS (
  SELECT 1 FROM productos pr WHERE pr.negocio_id = '69a10caa-f581-448d-b5df-d65ea426e2fb' AND pr.nombre = p.nombre
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3b. PRODUCTOS — Imperio del Postre
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO productos (negocio_id, nombre, precio, descripcion, imagen, categoria, categoria_id, unidad, disponible)
SELECT
  'a4dda1ba-74b6-401f-937e-999303c12ca1', p.nombre, p.precio, p.descripcion, p.imagen, p.categoria,
  (SELECT id FROM categorias WHERE negocio_id = 'a4dda1ba-74b6-401f-937e-999303c12ca1' AND nombre = p.categoria LIMIT 1),
  p.unidad, p.disponible
FROM (VALUES
  ('Torta de Chocolate', 45000, 'Torta húmeda de chocolate belga con ganache', 'https://images.unsplash.com/photo-1606313564200-e75d5e304022?w=400&q=80', 'Tortas', 'porción', true),
  ('Cheesecake de Fresa', 12000, 'Cheesecake cremoso con coulis de fresa natural', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80', 'Postres Individuales', 'unidad', true),
  ('Brownie con Helado', 14000, 'Brownie caliente con bola de helado de vainilla', 'https://images.unsplash.com/photo-1606313564200-e75d5e304022?w=400&q=80', 'Postres Individuales', 'unidad', true),
  ('Tres Leches Clásico', 10000, 'Bizcocho empapado en tres leches con crema chantilly', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', 'Postres Individuales', 'unidad', true),
  ('Helado Artesanal 2 Bolas', 9000, 'Vainilla, chocolate, fresa o maracuyá', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', 'Helados', 'unidad', true),
  ('Malteada Oreo', 13000, 'Malteada cremosa con galletas Oreo trituradas', 'https://images.unsplash.com/photo-1546173159-315724a3167b?w=400&q=80', 'Bebidas Frías', 'unidad', true),
  ('Frappe de Caramelo', 11000, 'Frappé de café con caramelo y crema batida', 'https://images.unsplash.com/photo-1546173159-315724a3167b?w=400&q=80', 'Bebidas Frías', 'unidad', true),
  ('Torta Red Velvet (Entera)', 85000, 'Torta red velvet para 8-10 personas', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', 'Tortas', 'unidad', true),
  ('Combo Dulce Pareja', 22000, '2 postres a elegir + 2 bebidas frías', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', 'Especiales del Día', 'combo', true),
  ('Profiteroles x4', 15000, 'Profiteroles rellenos de crema pastelera con chocolate', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', 'Especiales del Día', 'porción', false)
) AS p(nombre, precio, descripcion, imagen, categoria, unidad, disponible)
WHERE NOT EXISTS (
  SELECT 1 FROM productos pr WHERE pr.negocio_id = 'a4dda1ba-74b6-401f-937e-999303c12ca1' AND pr.nombre = p.nombre
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. DOMICILIARIOS
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SUSCRIPCIONES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO suscripciones (negocio_id, plan, estado, fecha_inicio, fecha_fin)
VALUES ('a4dda1ba-74b6-401f-937e-999303c12ca1', 'pro', 'trial', NOW(), NOW() + INTERVAL '7 days')
ON CONFLICT (negocio_id) DO UPDATE SET
  plan = EXCLUDED.plan,
  estado = EXCLUDED.estado,
  fecha_inicio = EXCLUDED.fecha_inicio,
  fecha_fin = EXCLUDED.fecha_fin,
  updated_at = NOW();

UPDATE suscripciones SET
  plan = 'pro',
  estado = 'activo',
  fecha_inicio = NOW(),
  fecha_fin = NULL,
  updated_at = NOW()
WHERE negocio_id = '69a10caa-f581-448d-b5df-d65ea426e2fb';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. PEDIDOS — Pizza Liberty (15 pedidos de ejemplo)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  biz_id UUID := '69a10caa-f581-448d-b5df-d65ea426e2fb';
  driver_id UUID;
  cnt INT;
BEGIN
  SELECT COUNT(*) INTO cnt FROM pedidos WHERE negocio_id = biz_id;
  IF cnt >= 15 THEN RETURN; END IF;

  SELECT id INTO driver_id FROM domiciliarios WHERE negocio_id = biz_id AND activo = true LIMIT 1;

  INSERT INTO pedidos (negocio_id, nombre, telefono, direccion, ubicacion_link, comentarios, total, domicilio_costo, distancia_km, items, productos, estado, status, entrega_metodo, pago_metodo, token, domiciliario_id, created_at)
  VALUES
  (biz_id, 'Juan Pérez', '573001112233', 'Calle 10 #4-56, Barrio Caobos, Cúcuta', 'https://maps.google.com/?q=7.89,-72.50', '', 63500, 3500, 3.2,
   '[{"id":1,"nombre":"Pizza Pepperoni","precio":32000,"cantidad":1,"nota":""},{"id":2,"nombre":"Gaseosa 1.5L","precio":7000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Pizza Pepperoni","price":32000,"quantity":1},{"name":"Gaseosa 1.5L","price":7000,"quantity":1}]'::jsonb,
   'nuevo', 'nuevo', 'envio', 'efectivo', 'tok_pizza_001', NULL, NOW() - INTERVAL '0 days'),

  (biz_id, 'Ana Rodríguez', '573002223344', 'Av. Gran Colombia #15-20, Cúcuta', 'https://maps.google.com/?q=7.88,-72.49', 'Extra queso', 82000, 4200, 5.1,
   '[{"id":1,"nombre":"Pizza Liberty Especial","precio":42000,"cantidad":1,"nota":"Extra queso"},{"id":2,"nombre":"Papas Liberty","precio":12000,"cantidad":1,"nota":""},{"id":3,"nombre":"Limonada Natural","precio":6000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Pizza Liberty Especial","price":42000,"quantity":1},{"name":"Papas Liberty","price":12000,"quantity":1}]'::jsonb,
   'preparando', 'preparando', 'envio', 'transferencia', 'tok_pizza_002', NULL, NOW() - INTERVAL '1 days'),

  (biz_id, 'Carlos Gómez', '573003334455', 'Calle 15 #8-90, Barrio La Playita, Cúcuta', 'https://maps.google.com/?q=7.87,-72.51', '', 75000, 3500, 2.8,
   '[{"id":1,"nombre":"Combo Familiar","precio":75000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Combo Familiar","price":75000,"quantity":1}]'::jsonb,
   'enviado', 'enviado', 'envio', 'efectivo', 'tok_pizza_003', driver_id, NOW() - INTERVAL '2 days'),

  (biz_id, 'Laura Martínez', '573004445566', 'Recogida en local', NULL, '', 35000, 0, NULL,
   '[{"id":1,"nombre":"Pizza Margarita","precio":28000,"cantidad":1,"nota":""},{"id":2,"nombre":"Cerveza Águila","precio":5000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Pizza Margarita","price":28000,"quantity":1},{"name":"Cerveza Águila","price":5000,"quantity":1}]'::jsonb,
   'entregado', 'entregado', 'local', 'efectivo', 'tok_pizza_004', NULL, NOW() - INTERVAL '3 days'),

  (biz_id, 'Diego Herrera', '573005556677', 'Av. 11 #2-34, Barrio El Salado, Cúcuta', 'https://maps.google.com/?q=7.90,-72.48', 'Sin cebolla', 53000, 3800, 4.0,
   '[{"id":1,"nombre":"Pizza Hawaiana","precio":30000,"cantidad":1,"nota":"Sin cebolla"},{"id":2,"nombre":"Alitas BBQ x6","precio":18000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Pizza Hawaiana","price":30000,"quantity":1},{"name":"Alitas BBQ x6","price":18000,"quantity":1}]'::jsonb,
   'entregado', 'entregado', 'envio', 'transferencia', 'tok_pizza_005', driver_id, NOW() - INTERVAL '4 days'),

  (biz_id, 'Sofía Castro', '573006667788', 'Calle 5 #12-78, Centro, Cúcuta', 'https://maps.google.com/?q=7.89,-72.50', '', 38500, 3500, 1.5,
   '[{"id":1,"nombre":"Pizza Cuatro Quesos","precio":35000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Pizza Cuatro Quesos","price":35000,"quantity":1}]'::jsonb,
   'nuevo', 'nuevo', 'envio', 'efectivo', 'tok_pizza_006', NULL, NOW() - INTERVAL '5 days'),

  (biz_id, 'Miguel Torres', '573007778899', 'Conjunto Los Pinos, Torre B Apt 502, Cúcuta', 'https://maps.google.com/?q=7.88,-72.52', '', 67000, 5500, 7.2,
   '[{"id":1,"nombre":"Pizza Pepperoni","precio":32000,"cantidad":2,"nota":""}]'::jsonb,
   '[{"name":"Pizza Pepperoni","price":32000,"quantity":2}]'::jsonb,
   'preparando', 'preparando', 'envio', 'efectivo', 'tok_pizza_007', NULL, NOW() - INTERVAL '6 days'),

  (biz_id, 'Valentina Ruiz', '573008889900', 'Av. 0 #15-67, Barrio La Libertad, Cúcuta', 'https://maps.google.com/?q=7.89,-72.51', '', 45500, 3500, 2.0,
   '[{"id":1,"nombre":"Pizza Margarita","precio":28000,"cantidad":1,"nota":""},{"id":2,"nombre":"Papas Liberty","precio":12000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Pizza Margarita","price":28000,"quantity":1},{"name":"Papas Liberty","price":12000,"quantity":1}]'::jsonb,
   'enviado', 'enviado', 'envio', 'transferencia', 'tok_pizza_008', driver_id, NOW() - INTERVAL '1 days'),

  (biz_id, 'Roberto Díaz', '573009990011', 'Recogida en local', NULL, 'Para llevar', 42000, 0, NULL,
   '[{"id":1,"nombre":"Pizza Liberty Especial","precio":42000,"cantidad":1,"nota":"Para llevar"}]'::jsonb,
   '[{"name":"Pizza Liberty Especial","price":42000,"quantity":1}]'::jsonb,
   'entregado', 'entregado', 'local', 'efectivo', 'tok_pizza_009', NULL, NOW() - INTERVAL '2 days'),

  (biz_id, 'Camila Vargas', '573010101212', 'Carrera 15 #9-23, Cúcuta', 'https://maps.google.com/?q=7.87,-72.49', '', 50000, 4000, 4.5,
   '[{"id":1,"nombre":"Pizza Hawaiana","precio":30000,"cantidad":1,"nota":""},{"id":2,"nombre":"Limonada Natural","precio":6000,"cantidad":1,"nota":""},{"id":3,"nombre":"Gaseosa 1.5L","precio":7000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Pizza Hawaiana","price":30000,"quantity":1}]'::jsonb,
   'nuevo', 'nuevo', 'envio', 'efectivo', 'tok_pizza_010', NULL, NOW() - INTERVAL '0 days');
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6b. PEDIDOS — Imperio del Postre (10 pedidos)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  biz_id UUID := 'a4dda1ba-74b6-401f-937e-999303c12ca1';
  driver_id UUID;
  cnt INT;
BEGIN
  SELECT COUNT(*) INTO cnt FROM pedidos WHERE negocio_id = biz_id;
  IF cnt >= 10 THEN RETURN; END IF;

  SELECT id INTO driver_id FROM domiciliarios WHERE negocio_id = biz_id AND activo = true LIMIT 1;

  INSERT INTO pedidos (negocio_id, nombre, telefono, direccion, ubicacion_link, comentarios, total, domicilio_costo, distancia_km, items, productos, estado, status, entrega_metodo, pago_metodo, token, domiciliario_id, created_at)
  VALUES
  (biz_id, 'María López', '573011122233', 'Calle 8 #3-45, Barrio San Luis, Cúcuta', 'https://maps.google.com/?q=7.88,-72.50', '', 16500, 4500, NULL,
   '[{"id":1,"nombre":"Cheesecake de Fresa","precio":12000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Cheesecake de Fresa","price":12000,"quantity":1}]'::jsonb,
   'nuevo', 'nuevo', 'envio', 'efectivo', 'tok_postre_001', NULL, NOW() - INTERVAL '0 days'),

  (biz_id, 'Pedro Ramírez', '573022233344', 'Av. 3 #7-12, Cúcuta', 'https://maps.google.com/?q=7.89,-72.49', 'Cumpleaños', 49500, 4500, NULL,
   '[{"id":1,"nombre":"Torta de Chocolate","precio":45000,"cantidad":1,"nota":"Feliz cumpleaños"}]'::jsonb,
   '[{"name":"Torta de Chocolate","price":45000,"quantity":1}]'::jsonb,
   'preparando', 'preparando', 'envio', 'transferencia', 'tok_postre_002', NULL, NOW() - INTERVAL '1 days'),

  (biz_id, 'Lucía Gómez', '573033344455', 'Recogida en local', NULL, '', 22000, 0, NULL,
   '[{"id":1,"nombre":"Combo Dulce Pareja","precio":22000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Combo Dulce Pareja","price":22000,"quantity":1}]'::jsonb,
   'entregado', 'entregado', 'local', 'efectivo', 'tok_postre_003', NULL, NOW() - INTERVAL '2 days'),

  (biz_id, 'Felipe Castro', '573044455566', 'Urbanización El Prado, Cúcuta', 'https://maps.google.com/?q=7.87,-72.51', '', 18500, 4500, NULL,
   '[{"id":1,"nombre":"Brownie con Helado","precio":14000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Brownie con Helado","price":14000,"quantity":1}]'::jsonb,
   'enviado', 'enviado', 'envio', 'efectivo', 'tok_postre_004', driver_id, NOW() - INTERVAL '3 days'),

  (biz_id, 'Isabella Ruiz', '573055566677', 'Calle 14 #6-78, Cúcuta', 'https://maps.google.com/?q=7.90,-72.48', '', 15500, 4500, NULL,
   '[{"id":1,"nombre":"Helado Artesanal 2 Bolas","precio":9000,"cantidad":1,"nota":""},{"id":2,"nombre":"Malteada Oreo","precio":13000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Helado Artesanal 2 Bolas","price":9000,"quantity":1},{"name":"Malteada Oreo","price":13000,"quantity":1}]'::jsonb,
   'entregado', 'entregado', 'envio', 'transferencia', 'tok_postre_005', driver_id, NOW() - INTERVAL '4 days'),

  (biz_id, 'Daniel Ortiz', '573066677788', 'Recogida en local', NULL, '', 10000, 0, NULL,
   '[{"id":1,"nombre":"Tres Leches Clásico","precio":10000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Tres Leches Clásico","price":10000,"quantity":1}]'::jsonb,
   'entregado', 'entregado', 'local', 'efectivo', 'tok_postre_006', NULL, NOW() - INTERVAL '5 days'),

  (biz_id, 'Paula Mendoza', '573077788899', 'Av. Libertadores #20-15, Cúcuta', 'https://maps.google.com/?q=7.88,-72.52', 'Sin nueces', 15500, 4500, NULL,
   '[{"id":1,"nombre":"Frappe de Caramelo","precio":11000,"cantidad":1,"nota":"Sin nueces"}]'::jsonb,
   '[{"name":"Frappe de Caramelo","price":11000,"quantity":1}]'::jsonb,
   'nuevo', 'nuevo', 'envio', 'efectivo', 'tok_postre_007', NULL, NOW() - INTERVAL '0 days'),

  (biz_id, 'Andrés Silva', '573088899900', 'Calle 20 #4-56, Cúcuta', 'https://maps.google.com/?q=7.89,-72.50', '', 89500, 4500, NULL,
   '[{"id":1,"nombre":"Torta Red Velvet (Entera)","precio":85000,"cantidad":1,"nota":""}]'::jsonb,
   '[{"name":"Torta Red Velvet (Entera)","price":85000,"quantity":1}]'::jsonb,
   'preparando', 'preparando', 'envio', 'transferencia', 'tok_postre_008', NULL, NOW() - INTERVAL '1 days');
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Resumen
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 'negocios' AS tabla, COUNT(*) AS filas FROM negocios
UNION ALL SELECT 'categorias', COUNT(*) FROM categorias
UNION ALL SELECT 'productos', COUNT(*) FROM productos
UNION ALL SELECT 'domiciliarios', COUNT(*) FROM domiciliarios
UNION ALL SELECT 'suscripciones', COUNT(*) FROM suscripciones
UNION ALL SELECT 'pedidos', COUNT(*) FROM pedidos
ORDER BY tabla;

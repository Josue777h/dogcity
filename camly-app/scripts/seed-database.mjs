/**
 * CAMLY — Seed de base de datos completo
 * Ejecutar: node scripts/seed-database.mjs
 *
 * Enriquece las 6 tablas: negocios, categorias, productos,
 * domiciliarios, suscripciones, pedidos
 */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const IMG = {
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  postre: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80',
  bebida: 'https://images.unsplash.com/photo-1546173159-315724a3167b?w=400&q=80',
  papas: 'https://images.unsplash.com/photo-1573080496219-bfa03f94544b?w=400&q=80',
  alitas: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80',
  ensalada: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
  brownie: 'https://images.unsplash.com/photo-1606313564200-e75d5e304022?w=400&q=80',
  cheesecake: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80',
  helado: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
};

const NEGOCIOS = {
  pizza: {
    id: '69a10caa-f581-448d-b5df-d65ea426e2fb',
    slug: 'pizzaliberty',
    update: {
      nombre_visible: 'Pizza Liberty',
      telefono: '573143243707',
      whatsapp_contacto: '573143243707',
      direccion: 'Av. 0 #10-45, Barrio La Libertad, Cúcuta',
      theme_color: '#EA580C',
      color_secundario: '#FFF7ED',
      instagram: '@pizzaliberty_cuc',
      facebook: 'PizzaLibertyCucuta',
      tiktok: '@pizzaliberty',
      footer_message: 'Las mejores pizzas artesanales de Cúcuta. Horario: Lun-Dom 11am - 11pm',
      pago_banco: 'Nequi / Bancolombia',
      pago_alias: '3143243707',
      metodos_pago: ['efectivo', 'transferencia'],
      lat: 7.89391,
      lng: -72.50782,
      tipo_domicilio: 'automatico',
      costo_por_km: 1200,
      domicilio_minimo: 3500,
      precio_domicilio: 0,
      logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80',
    },
    categorias: ['Pizzas Clásicas', 'Pizzas Premium', 'Bebidas', 'Acompañantes', 'Promociones'],
    productos: [
      { nombre: 'Pizza Margarita', precio: 28000, descripcion: 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva', categoria: 'Pizzas Clásicas', imagen: IMG.pizza, unidad: 'unidad' },
      { nombre: 'Pizza Pepperoni', precio: 32000, descripcion: 'Pepperoni premium, queso mozzarella y salsa especial de la casa', categoria: 'Pizzas Clásicas', imagen: IMG.pizza, unidad: 'unidad' },
      { nombre: 'Pizza Hawaiana', precio: 30000, descripcion: 'Jamón, piña caramelizada y extra queso mozzarella', categoria: 'Pizzas Clásicas', imagen: IMG.pizza, unidad: 'unidad' },
      { nombre: 'Pizza Cuatro Quesos', precio: 35000, descripcion: 'Mozzarella, parmesano, gorgonzola y queso crema', categoria: 'Pizzas Premium', imagen: IMG.pizza, unidad: 'unidad' },
      { nombre: 'Pizza Liberty Especial', precio: 42000, descripcion: 'Carne, pollo, champiñones, pimientos y doble queso', categoria: 'Pizzas Premium', imagen: IMG.pizza, unidad: 'unidad' },
      { nombre: 'Pizza Vegetariana', precio: 29000, descripcion: 'Champiñones, pimientos, cebolla, aceitunas y espinaca', categoria: 'Pizzas Premium', imagen: IMG.pizza, unidad: 'unidad', disponible: false },
      { nombre: 'Combo Familiar', precio: 75000, descripcion: '2 pizzas medianas + gaseosa 1.5L + papas', categoria: 'Promociones', imagen: IMG.pizza, unidad: 'combo' },
      { nombre: 'Papas Liberty', precio: 12000, descripcion: 'Papas crujientes con queso cheddar y tocino', categoria: 'Acompañantes', imagen: IMG.papas, unidad: 'porción' },
      { nombre: 'Alitas BBQ x6', precio: 18000, descripcion: '6 alitas bañadas en salsa BBQ ahumada', categoria: 'Acompañantes', imagen: IMG.alitas, unidad: 'porción' },
      { nombre: 'Gaseosa 1.5L', precio: 7000, descripcion: 'Coca-Cola, Sprite o Colombiana', categoria: 'Bebidas', imagen: IMG.bebida, unidad: 'unidad' },
      { nombre: 'Limonada Natural', precio: 6000, descripcion: 'Limonada fresca 500ml', categoria: 'Bebidas', imagen: IMG.bebida, unidad: 'unidad' },
      { nombre: 'Cerveza Águila', precio: 5000, descripcion: 'Botella 330ml bien fría', categoria: 'Bebidas', imagen: IMG.bebida, unidad: 'unidad' },
    ],
    domiciliarios: [
      { nombre: 'Carlos Mendoza', telefono: '573001234567', activo: true },
      { nombre: 'Andrés Gómez', telefono: '573109876543', activo: true },
      { nombre: 'Luis Ramírez', telefono: '573207654321', activo: false },
    ],
  },
  postre: {
    id: 'a4dda1ba-74b6-401f-937e-999303c12ca1',
    slug: 'imperiodelpostre',
    update: {
      nombre_visible: 'Imperio del Postre',
      telefono: '573142185621',
      whatsapp_contacto: '573142185621',
      direccion: 'Calle 12 #5-23, Centro, Cúcuta',
      theme_color: '#DB2777',
      color_secundario: '#FDF2F8',
      instagram: '@imperiodelpostre',
      facebook: 'ImperioDelPostreCuc',
      tiktok: '@imperiodelpostre',
      footer_message: 'Endulzamos tu día con los mejores postres artesanales. Pedidos hasta las 9pm.',
      pago_banco: 'Daviplata / Nequi',
      pago_alias: '3142185621',
      metodos_pago: ['efectivo', 'transferencia'],
      lat: 7.8897,
      lng: -72.4968,
      tipo_domicilio: 'fijo',
      costo_por_km: 1000,
      domicilio_minimo: 3000,
      precio_domicilio: 4500,
      logo_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&q=80',
    },
    categorias: ['Tortas', 'Postres Individuales', 'Helados', 'Bebidas Frías', 'Especiales del Día'],
    productos: [
      { nombre: 'Torta de Chocolate', precio: 45000, descripcion: 'Torta húmeda de chocolate belga con ganache, porción personal', categoria: 'Tortas', imagen: IMG.brownie, unidad: 'porción' },
      { nombre: 'Cheesecake de Fresa', precio: 12000, descripcion: 'Cheesecake cremoso con coulis de fresa natural', categoria: 'Postres Individuales', imagen: IMG.cheesecake, unidad: 'unidad' },
      { nombre: 'Brownie con Helado', precio: 14000, descripcion: 'Brownie caliente con bola de helado de vainilla', categoria: 'Postres Individuales', imagen: IMG.brownie, unidad: 'unidad' },
      { nombre: 'Tres Leches Clásico', precio: 10000, descripcion: 'Bizcocho empapado en tres leches con crema chantilly', categoria: 'Postres Individuales', imagen: IMG.postre, unidad: 'unidad' },
      { nombre: 'Helado Artesanal 2 Bolas', precio: 9000, descripcion: 'Vainilla, chocolate, fresa o maracuyá', categoria: 'Helados', imagen: IMG.helado, unidad: 'unidad' },
      { nombre: 'Malteada Oreo', precio: 13000, descripcion: 'Malteada cremosa con galletas Oreo trituradas', categoria: 'Bebidas Frías', imagen: IMG.bebida, unidad: 'unidad' },
      { nombre: 'Frappe de Caramelo', precio: 11000, descripcion: 'Frappé de café con caramelo y crema batida', categoria: 'Bebidas Frías', imagen: IMG.bebida, unidad: 'unidad' },
      { nombre: 'Torta Red Velvet (Entera)', precio: 85000, descripcion: 'Torta red velvet para 8-10 personas, frosting de queso crema', categoria: 'Tortas', imagen: IMG.postre, unidad: 'unidad' },
      { nombre: 'Combo Dulce Pareja', precio: 22000, descripcion: '2 postres a elegir + 2 bebidas frías', categoria: 'Especiales del Día', imagen: IMG.postre, unidad: 'combo' },
      { nombre: 'Profiteroles x4', precio: 15000, descripcion: 'Profiteroles rellenos de crema pastelera con chocolate', categoria: 'Especiales del Día', imagen: IMG.postre, unidad: 'porción', disponible: false },
    ],
    domiciliarios: [
      { nombre: 'María Fernández', telefono: '573154567890', activo: true },
      { nombre: 'Pedro Sánchez', telefono: '573165678901', activo: true },
    ],
  },
};

const CLIENTES = [
  { nombre: 'Juan Pérez', telefono: '573001112233', direccion: 'Calle 10 #4-56, Barrio Caobos, Cúcuta' },
  { nombre: 'Ana Rodríguez', telefono: '573002223344', direccion: 'Av. Gran Colombia #15-20, Cúcuta' },
  { nombre: 'Carlos Gómez', telefono: '573003334455', direccion: 'Calle 15 #8-90, Barrio La Playita, Cúcuta' },
  { nombre: 'Laura Martínez', telefono: '573004445566', direccion: 'Urbanización El Bosque, Mz 3 Casa 12, Cúcuta' },
  { nombre: 'Diego Herrera', telefono: '573005556677', direccion: 'Av. 11 #2-34, Barrio El Salado, Cúcuta' },
  { nombre: 'Sofía Castro', telefono: '573006667788', direccion: 'Calle 5 #12-78, Centro, Cúcuta' },
  { nombre: 'Miguel Torres', telefono: '573007778899', direccion: 'Conjunto Los Pinos, Torre B Apt 502, Cúcuta' },
  { nombre: 'Valentina Ruiz', telefono: '573008889900', direccion: 'Av. 0 #15-67, Barrio La Libertad, Cúcuta' },
  { nombre: 'Roberto Díaz', telefono: '573009990011', direccion: 'Calle 8 #3-45, Barrio San Luis, Cúcuta' },
  { nombre: 'Camila Vargas', telefono: '573010101212', direccion: 'Carrera 15 #9-23, Cúcuta' },
];

const ESTADOS = ['nuevo', 'preparando', 'enviado', 'entregado'];

function randomToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 8);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

function buildItems(productos, count = 2) {
  const shuffled = [...productos].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map(p => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    cantidad: Math.floor(Math.random() * 2) + 1,
    nota: '',
  }));
}

function orderTotal(items, domicilio = 0) {
  return items.reduce((s, i) => s + i.precio * i.cantidad, 0) + domicilio;
}

async function upsertNegocio(key) {
  const biz = NEGOCIOS[key];
  const { error } = await supabase.from('negocios').update(biz.update).eq('id', biz.id);
  if (error) throw new Error(`negocios ${key}: ${error.message}`);
  console.log(`✓ Negocio actualizado: ${biz.update.nombre_visible}`);
}

async function seedCategorias(key) {
  const biz = NEGOCIOS[key];
  const { data: existing } = await supabase.from('categorias').select('nombre').eq('negocio_id', biz.id);
  const existingNames = new Set((existing || []).map(c => c.nombre));

  const toInsert = biz.categorias
    .filter(n => !existingNames.has(n))
    .map(nombre => ({ negocio_id: biz.id, nombre }));

  if (toInsert.length === 0) {
    console.log(`  categorias ${key}: ya existen`);
    return {};
  }

  const { data, error } = await supabase.from('categorias').insert(toInsert).select();
  if (error) throw new Error(`categorias ${key}: ${error.message}`);

  const map = {};
  for (const cat of [...(existing || []), ...(data || [])]) {
    map[cat.nombre] = cat.id;
  }
  console.log(`  ✓ ${data.length} categorías creadas (${key})`);
  return map;
}

async function getCategoriaMap(negocioId) {
  const { data } = await supabase.from('categorias').select('id, nombre').eq('negocio_id', negocioId);
  return Object.fromEntries((data || []).map(c => [c.nombre, c.id]));
}

async function seedProductos(key, catMap) {
  const biz = NEGOCIOS[key];
  const { data: existing } = await supabase.from('productos').select('nombre').eq('negocio_id', biz.id);
  const existingNames = new Set((existing || []).map(p => p.nombre));

  const toInsert = biz.productos
    .filter(p => !existingNames.has(p.nombre))
    .map(p => ({
      negocio_id: biz.id,
      nombre: p.nombre,
      precio: p.precio,
      descripcion: p.descripcion,
      imagen: p.imagen,
      categoria: p.categoria,
      categoria_id: catMap[p.categoria] || null,
      unidad: p.unidad || 'unidad',
      disponible: p.disponible !== false,
    }));

  if (toInsert.length === 0) {
    console.log(`  productos ${key}: ya existen`);
    const { data } = await supabase.from('productos').select('*').eq('negocio_id', biz.id);
    return data || [];
  }

  const { data, error } = await supabase.from('productos').insert(toInsert).select();
  if (error) throw new Error(`productos ${key}: ${error.message}`);
  console.log(`  ✓ ${data.length} productos creados (${key})`);

  const { data: all } = await supabase.from('productos').select('*').eq('negocio_id', biz.id);
  return all || [];
}

async function seedDomiciliarios(key) {
  const biz = NEGOCIOS[key];
  const { data: existing } = await supabase.from('domiciliarios').select('telefono').eq('negocio_id', biz.id);
  const existingPhones = new Set((existing || []).map(d => d.telefono));

  const toInsert = biz.domiciliarios
    .filter(d => !existingPhones.has(d.telefono))
    .map(d => ({ ...d, negocio_id: biz.id }));

  if (toInsert.length === 0) {
    console.log(`  domiciliarios ${key}: ya existen`);
    const { data } = await supabase.from('domiciliarios').select('*').eq('negocio_id', biz.id);
    return data || [];
  }

  const { data, error } = await supabase.from('domiciliarios').insert(toInsert).select();
  if (error) throw new Error(`domiciliarios ${key}: ${error.message}`);
  console.log(`  ✓ ${data.length} domiciliarios creados (${key})`);

  const { data: all } = await supabase.from('domiciliarios').select('*').eq('negocio_id', biz.id);
  return all || [];
}

async function seedSuscripcion(key, estado = 'activo') {
  const biz = NEGOCIOS[key];
  const fin = new Date();
  fin.setDate(fin.getDate() + (estado === 'trial' ? 7 : 30));

  const { data: existing } = await supabase.from('suscripciones').select('id').eq('negocio_id', biz.id).maybeSingle();

  const payload = {
    negocio_id: biz.id,
    plan: 'pro',
    estado,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: estado === 'activo' ? null : fin.toISOString(),
  };

  if (existing) {
    const { error } = await supabase.from('suscripciones').update(payload).eq('id', existing.id);
    if (error) throw new Error(`suscripciones update ${key}: ${error.message}`);
    console.log(`  ✓ Suscripción actualizada (${key}): ${estado}`);
  } else {
    const { error } = await supabase.from('suscripciones').insert([payload]);
    if (error) throw new Error(`suscripciones insert ${key}: ${error.message}`);
    console.log(`  ✓ Suscripción creada (${key}): ${estado}`);
  }
}

async function seedPedidos(key, productos, domiciliarios) {
  const biz = NEGOCIOS[key];
  const { count } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('negocio_id', biz.id);
  const target = 15;
  const toCreate = Math.max(0, target - (count || 0));

  if (toCreate === 0) {
    console.log(`  pedidos ${key}: ya tiene ${count} (objetivo ${target})`);
    return;
  }

  const activeDrivers = domiciliarios.filter(d => d.activo);
  const pedidos = [];

  for (let i = 0; i < toCreate; i++) {
    const cliente = CLIENTES[i % CLIENTES.length];
    const estado = ESTADOS[i % ESTADOS.length];
    const entrega = i % 4 === 3 ? 'local' : 'envio';
    const pago = i % 3 === 0 ? 'transferencia' : 'efectivo';
    const items = buildItems(productos, 1 + (i % 3));
    const domicilioCosto = entrega === 'envio' ? (biz.update.precio_domicilio || biz.update.domicilio_minimo || 3500) : 0;
    const distancia = entrega === 'envio' ? +(2 + Math.random() * 8).toFixed(1) : null;
    const total = orderTotal(items, domicilioCosto);
    const driver = estado === 'enviado' || estado === 'entregado'
      ? activeDrivers[i % activeDrivers.length]?.id || null
      : null;

    pedidos.push({
      negocio_id: biz.id,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: entrega === 'envio' ? cliente.direccion : 'Recogida en local',
      ubicacion_link: entrega === 'envio' ? `https://maps.google.com/?q=7.89,-72.50` : null,
      comentarios: i % 5 === 0 ? 'Sin cebolla por favor' : '',
      total,
      domicilio_costo: domicilioCosto,
      distancia_km: distancia,
      items,
      productos: items.map(i => ({ name: i.nombre, price: i.precio, quantity: i.cantidad })),
      estado,
      status: estado,
      entrega_metodo: entrega,
      pago_metodo: pago,
      token: randomToken(),
      domiciliario_id: driver,
      created_at: daysAgo(i % 7),
    });
  }

  const { error } = await supabase.from('pedidos').insert(pedidos);
  if (error) throw new Error(`pedidos ${key}: ${error.message}`);
  console.log(`  ✓ ${pedidos.length} pedidos creados (${key})`);
}

async function printSummary() {
  for (const table of ['negocios', 'categorias', 'productos', 'domiciliarios', 'suscripciones', 'pedidos']) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`  ${table}: ${count} filas`);
  }
}

async function main() {
  console.log('\n🌱 CAMLY — Seed de base de datos\n');

  for (const key of ['pizza', 'postre']) {
    console.log(`\n── ${NEGOCIOS[key].update.nombre_visible} ──`);
    await upsertNegocio(key);
    await seedCategorias(key);
    const catMap = await getCategoriaMap(NEGOCIOS[key].id);
    const productos = await seedProductos(key, catMap);
    const domiciliarios = await seedDomiciliarios(key);
    await seedSuscripcion(key, key === 'pizza' ? 'activo' : 'trial');
    await seedPedidos(key, productos, domiciliarios);
  }

  console.log('\n── Resumen final ──');
  await printSummary();
  console.log('\n✅ Seed completado.\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});

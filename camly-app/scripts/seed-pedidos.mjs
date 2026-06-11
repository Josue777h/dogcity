/** Seed pedidos para ambos negocios */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BIZZ = [
  { id: '69a10caa-f581-448d-b5df-d65ea426e2fb', domicilio: 3500, target: 15 },
  { id: 'a4dda1ba-74b6-401f-937e-999303c12ca1', domicilio: 4500, target: 10 },
];

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
  { nombre: 'María López', telefono: '573011122233', direccion: 'Calle 8 #3-45, Barrio San Luis, Cúcuta' },
  { nombre: 'Pedro Ramírez', telefono: '573022233344', direccion: 'Av. 3 #7-12, Cúcuta' },
  { nombre: 'Lucía Gómez', telefono: '573033344455', direccion: 'Carrera 10 #5-67, Cúcuta' },
  { nombre: 'Felipe Castro', telefono: '573044455566', direccion: 'Urbanización El Prado, Cúcuta' },
  { nombre: 'Isabella Ruiz', telefono: '573055566677', direccion: 'Calle 14 #6-78, Cúcuta' },
];

const ESTADOS = ['nuevo', 'preparando', 'enviado', 'entregado'];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + (n % 8), (n * 7) % 60, 0, 0);
  return d.toISOString();
}

for (const biz of BIZZ) {
  const { count } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('negocio_id', biz.id);
  const toCreate = Math.max(0, biz.target - (count || 0));
  if (toCreate === 0) { console.log(`${biz.id}: ya tiene ${count} pedidos`); continue; }

  const { data: productos } = await supabase.from('productos').select('id, nombre, precio').eq('negocio_id', biz.id).eq('disponible', true);
  if (!productos?.length) { console.log(`${biz.id}: sin productos`); continue; }

  const pedidos = [];
  for (let i = 0; i < toCreate; i++) {
    const p1 = productos[i % productos.length];
    const p2 = productos[(i + 1) % productos.length];
    const qty1 = 1 + (i % 2);
    const entrega = i % 4 === 3 ? 'local' : 'envio';
    const domicilioCosto = entrega === 'envio' ? biz.domicilio : 0;
    const items = i % 3 === 0
      ? [{ id: p1.id, nombre: p1.nombre, precio: p1.precio, cantidad: qty1, nota: i % 5 === 0 ? 'Sin cebolla' : '' }]
      : [
          { id: p1.id, nombre: p1.nombre, precio: p1.precio, cantidad: 1, nota: '' },
          { id: p2.id, nombre: p2.nombre, precio: p2.precio, cantidad: 1, nota: '' },
        ];
    const total = items.reduce((s, x) => s + x.precio * x.cantidad, 0) + domicilioCosto;
    const estado = ESTADOS[i % ESTADOS.length];
    const cliente = CLIENTES[i % CLIENTES.length];

    pedidos.push({
      negocio_id: biz.id,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      direccion: entrega === 'envio' ? cliente.direccion : 'Recogida en local',
      ubicacion_link: entrega === 'envio' ? 'https://maps.google.com/?q=7.89,-72.50' : null,
      comentarios: i % 5 === 0 ? 'Entregar antes de las 8pm' : '',
      total,
      domicilio_costo: domicilioCosto,
      distancia_km: entrega === 'envio' ? +(1.5 + (i % 6)).toFixed(1) : null,
      items,
      productos: items.map(x => ({ name: x.nombre, price: x.precio, quantity: x.cantidad })),
      estado,
      status: estado,
      entrega_metodo: entrega,
      pago_metodo: i % 3 === 0 ? 'transferencia' : 'efectivo',
      token: `seed_${biz.id.slice(0, 8)}_${i}_${Date.now()}`,
      created_at: daysAgo(i % 7),
    });
  }

  const { error } = await supabase.from('pedidos').insert(pedidos);
  console.log(`${biz.id}: +${pedidos.length} pedidos`, error?.message || 'OK');
}

for (const t of ['negocios','categorias','productos','domiciliarios','suscripciones','pedidos']) {
  const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
  console.log(`${t}: ${count}`);
}

// Clean test pedido if exists
await supabase.from('pedidos').delete().eq('nombre', 'Test');

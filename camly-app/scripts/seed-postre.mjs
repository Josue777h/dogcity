/** Continúa seed para Imperio del Postre (post RLS partial run) */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const POSTRE = 'a4dda1ba-74b6-401f-937e-999303c12ca1';

const categorias = ['Tortas', 'Postres Individuales', 'Helados', 'Bebidas Frías', 'Especiales del Día'];
for (const nombre of categorias) {
  const { data: ex } = await supabase.from('categorias').select('id').eq('negocio_id', POSTRE).eq('nombre', nombre).maybeSingle();
  if (!ex) await supabase.from('categorias').insert([{ negocio_id: POSTRE, nombre }]);
}
console.log('categorias postre OK');

const { data: cats } = await supabase.from('categorias').select('*').eq('negocio_id', POSTRE);
const catMap = Object.fromEntries(cats.map(c => [c.nombre, c.id]));

const productos = [
  { nombre: 'Torta de Chocolate', precio: 45000, descripcion: 'Torta húmeda de chocolate belga con ganache', imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e304022?w=400&q=80', categoria: 'Tortas', unidad: 'porción' },
  { nombre: 'Cheesecake de Fresa', precio: 12000, descripcion: 'Cheesecake cremoso con coulis de fresa natural', imagen: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80', categoria: 'Postres Individuales', unidad: 'unidad' },
  { nombre: 'Brownie con Helado', precio: 14000, descripcion: 'Brownie caliente con bola de helado de vainilla', imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e304022?w=400&q=80', categoria: 'Postres Individuales', unidad: 'unidad' },
  { nombre: 'Tres Leches Clásico', precio: 10000, descripcion: 'Bizcocho empapado en tres leches con crema chantilly', imagen: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', categoria: 'Postres Individuales', unidad: 'unidad' },
  { nombre: 'Helado Artesanal 2 Bolas', precio: 9000, descripcion: 'Vainilla, chocolate, fresa o maracuyá', imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', categoria: 'Helados', unidad: 'unidad' },
  { nombre: 'Malteada Oreo', precio: 13000, descripcion: 'Malteada cremosa con galletas Oreo trituradas', imagen: 'https://images.unsplash.com/photo-1546173159-315724a3167b?w=400&q=80', categoria: 'Bebidas Frías', unidad: 'unidad' },
  { nombre: 'Frappe de Caramelo', precio: 11000, descripcion: 'Frappé de café con caramelo y crema batida', imagen: 'https://images.unsplash.com/photo-1546173159-315724a3167b?w=400&q=80', categoria: 'Bebidas Frías', unidad: 'unidad' },
  { nombre: 'Torta Red Velvet (Entera)', precio: 85000, descripcion: 'Torta red velvet para 8-10 personas', imagen: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', categoria: 'Tortas', unidad: 'unidad' },
  { nombre: 'Combo Dulce Pareja', precio: 22000, descripcion: '2 postres a elegir + 2 bebidas frías', imagen: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', categoria: 'Especiales del Día', unidad: 'combo' },
  { nombre: 'Profiteroles x4', precio: 15000, descripcion: 'Profiteroles rellenos de crema pastelera', imagen: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', categoria: 'Especiales del Día', unidad: 'porción', disponible: false },
];

for (const p of productos) {
  const { data: ex } = await supabase.from('productos').select('id').eq('negocio_id', POSTRE).eq('nombre', p.nombre).maybeSingle();
  if (!ex) {
    await supabase.from('productos').insert([{
      negocio_id: POSTRE,
      ...p,
      categoria_id: catMap[p.categoria],
      disponible: p.disponible !== false,
    }]);
  }
}
console.log('productos postre OK');

await supabase.from('negocios').update({
  nombre_visible: 'Imperio del Postre',
  whatsapp_contacto: '573142185621',
  direccion: 'Calle 12 #5-23, Centro, Cúcuta',
  theme_color: '#DB2777',
  instagram: '@imperiodelpostre',
  lat: 7.8897,
  lng: -72.4968,
  tipo_domicilio: 'fijo',
  precio_domicilio: 4500,
}).eq('id', POSTRE);
console.log('negocio postre OK');

for (const t of ['negocios','categorias','productos','domiciliarios','suscripciones','pedidos']) {
  const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
  console.log(t, count);
}

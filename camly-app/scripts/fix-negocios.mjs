import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const updates = [
  {
    id: '69a10caa-f581-448d-b5df-d65ea426e2fb',
    data: {
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
  },
  {
    id: 'a4dda1ba-74b6-401f-937e-999303c12ca1',
    data: {
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
  },
];

for (const u of updates) {
  const { error } = await supabase.from('negocios').update(u.data).eq('id', u.id);
  console.log(u.data.nombre_visible, error?.message || 'OK');
}

const { data } = await supabase.from('negocios').select('nombre_visible, direccion, theme_color, instagram, lat');
console.log(JSON.stringify(data, null, 2));

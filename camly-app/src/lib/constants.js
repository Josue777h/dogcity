// CAMLY SaaS — Supabase Configuration (Lee de .env.local con fallback)
const getEnv = (key, fallback) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

export const SUPABASE_URL = getEnv(
  'VITE_SUPABASE_URL',
  'https://euubmrswreyaxckgadpc.supabase.co'
);

export const SUPABASE_ANON_KEY = getEnv(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dWJtcnN3cmV5YXhja2dhZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDMxNjcsImV4cCI6MjEwNjAxOTE2N30.E1SoyxBgFwn_jaVzGEC6aGj1U6_rVrwrPdl74vkCAyI'
);

export const SUPABASE_PRODUCT_BUCKET = getEnv(
  'VITE_SUPABASE_PRODUCT_BUCKET',
  'product-images'
);

export const DEFAULT_IMAGE = '/images/placeholder.svg';
export const WHATSAPP_FALLBACK_PHONE = '573143243707';

export const PRODUCT_SCHEMA_VARIANTS = [
  {
    label: 'es-no-unit',
    select: 'id, nombre, precio, descripcion, imagen, categoria, categoria_id, disponible, negocio_id',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion', image: 'imagen', category: 'categoria', available: 'disponible' }
  },
  {
    label: 'es-full',
    select: 'id, nombre, precio, descripcion, unidad, imagen, categoria, categoria_id, disponible, negocio_id',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion', unit: 'unidad', image: 'imagen', category: 'categoria', available: 'disponible' }
  },
  {
    label: 'es-basic',
    select: 'id, nombre, precio, descripcion, categoria, categoria_id, disponible, negocio_id',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion', category: 'categoria', available: 'disponible' }
  },
];

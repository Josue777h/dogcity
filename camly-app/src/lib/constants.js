// CAMLY SaaS — Supabase Configuration
export const SUPABASE_URL = 'https://diaphikeanfkapoeynae.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYXBoaWtlYW5ma2Fwb2V5bmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTc1NDEsImV4cCI6MjA5MTE3MzU0MX0.eVAPQ7py4bfu3mTtzqv1dng5Czd2S_oGUxSOm3UOC58';
export const SUPABASE_PRODUCT_BUCKET = 'product-images';

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

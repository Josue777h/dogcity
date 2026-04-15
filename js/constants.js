export const DEFAULT_IMAGE = 'images/taza.svg';
export const CART_STORAGE_KEY = 'restaurante-carrito';
export const CUSTOMER_STORAGE_KEY = 'restaurante-cliente';
export const PRODUCT_NOTES_STORAGE_KEY = 'restaurante-notas-productos';
export const ORDER_COMMENT_STORAGE_KEY = 'restaurante-comentario-pedido';
export const ORDER_COUNTER_STORAGE_KEY = 'restaurante-contador-pedidos';
export const WHATSAPP_PHONE = '573143243707';

export const SUPABASE_URL = window.SUPABASE_URL || 'https://diaphikeanfkapoeynae.supabase.co';
export const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYXBoaWtlYW5ma2Fwb2V5bmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1OTc1NDEsImV4cCI6MjA5MTE3MzU0MX0.eVAPQ7py4bfu3mTtzqv1dng5Czd2S_oGUxSOm3UOC58';
export const SUPABASE_PRODUCT_BUCKET = 'product-images';

export const PRODUCT_SCHEMA_VARIANTS = [
  {
    label: 'es-no-unit',
    select: 'id, nombre, precio, descripcion, imagen, categoria, disponible',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion', image: 'imagen', category: 'categoria', available: 'disponible' }
  },
  {
    label: 'es-full',
    select: 'id, nombre, precio, descripcion, unidad, imagen, categoria, disponible',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion', unit: 'unidad', image: 'imagen', category: 'categoria', available: 'disponible' }
  },
  {
    label: 'es-basic',
    select: 'id, nombre, precio, descripcion, categoria, disponible',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion', category: 'categoria', available: 'disponible' }
  },
  {
    label: 'en-full',
    select: 'id, name, price, description, unit, image, category, available',
    fields: { name: 'name', price: 'price', description: 'description', unit: 'unit', image: 'image', category: 'category', available: 'available' }
  },
  {
    label: 'en-no-unit',
    select: 'id, name, price, description, image, category, available',
    fields: { name: 'name', price: 'price', description: 'description', image: 'image', category: 'category', available: 'available' }
  },
  {
    label: 'en-basic',
    select: 'id, name, price, description, category, available',
    fields: { name: 'name', price: 'price', description: 'description', category: 'category', available: 'available' }
  }
];

export const PLACEHOLDER_IMAGES = [
  'images/taza.svg',
  'images/camiseta.svg',
  'images/stickers.svg',
  'images/hat.svg',
  'images/uploads/foto.png'
];

export const DOGCITY_MENU_PRODUCTS = [
  {
    name: 'Perro Sencillo',
    price: 6000,
    description: 'Salchicha Delichi, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/uploads/foto.png',
    categoria: 'Perros',
    disponible: true
  },
  {
    name: 'Perro Doble',
    price: 7000,
    description: 'Dos salchichas Delichi, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/hat.svg',
    categoria: 'Perros',
    disponible: true
  },
  {
    name: 'Perro Americano',
    price: 10000,
    description: 'Pan brioche a base de papa, salchicha Zenú, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/camiseta.svg',
    categoria: 'Perros',
    disponible: true
  },
  {
    name: 'Perro Polaco',
    price: 10000,
    description: 'Pan brioche a base de papa, salchicha ranchera, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/stickers.svg',
    categoria: 'Perros',
    disponible: true
  },
  {
    name: 'Perro Mexicano',
    price: 10000,
    description: 'Pan brioche a base de papa, salchicha picante, chipotle, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/taza.svg',
    categoria: 'Perros',
    disponible: true
  },
  {
    name: 'Perro Alemán',
    price: 10000,
    description: 'Pan brioche a base de papa, salchicha de cerdo ahumada, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/uploads/DOGCITY.png',
    categoria: 'Perros',
    disponible: true
  }
];

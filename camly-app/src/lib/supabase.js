import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, PRODUCT_SCHEMA_VARIANTS, DEFAULT_IMAGE, SUPABASE_PRODUCT_BUCKET } from './constants';

// ── Singleton client ──
let client = null;
export function getSupabase() {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

// ── Schema detection (auto-adapt to DB columns) ──
let schemaCache = null;
async function detectSchema() {
  const supabase = getSupabase();
  for (const variant of PRODUCT_SCHEMA_VARIANTS) {
    const { error } = await supabase.from('productos').select(variant.select).limit(1);
    if (!error) { schemaCache = variant; return variant; }
  }
  throw new Error('No se pudo detectar la estructura de la tabla productos');
}

async function getSchema() {
  if (schemaCache) return schemaCache;
  return detectSchema();
}

function buildRecord(product, schema) {
  const record = {};
  if (schema.fields.name) record[schema.fields.name] = product.name;
  if (schema.fields.price) record[schema.fields.price] = Number(product.price);
  if (schema.fields.description) record[schema.fields.description] = product.description;
  if (schema.fields.unit) record[schema.fields.unit] = product.unit || 'unidad';
  if (schema.fields.image) record[schema.fields.image] = product.image || DEFAULT_IMAGE;
  if (schema.fields.category) record[schema.fields.category] = product.categoria || 'Varios';
  if (schema.fields.available) record[schema.fields.available] = product.disponible !== false;
  if (product.negocio_id) record.negocio_id = product.negocio_id;
  return record;
}

function normalizeProduct(row) {
  return {
    id: Number(row.id),
    name: row.nombre || row.name || 'Producto',
    price: Number(row.precio ?? row.price ?? 0),
    description: row.descripcion || row.description || '',
    unit: row.unidad || row.unit || 'unidad',
    image: row.imagen || row.image || DEFAULT_IMAGE,
    categoria: row.categoria || row.category || 'Varios',
    disponible: row.disponible ?? row.available ?? true,
    negocio_id: row.negocio_id,
  };
}

// ── Business (Negocio) ──
export async function fetchBusiness(slug) {
  const { data, error } = await getSupabase()
    .from('negocios')
    .select('id, nombre, nombre_visible, telefono')
    .eq('nombre', slug)
    .single();
  if (error) { console.error('Error negocio:', error); return null; }
  return data;
}

// ── Products ──
export async function fetchProducts(negocioId = null) {
  const schema = await getSchema();
  let query = getSupabase().from('productos').select(schema.select).order('id', { ascending: false });
  if (negocioId) query = query.eq('negocio_id', negocioId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

export async function createProduct(product) {
  const schema = await getSchema();
  const { data, error } = await getSupabase()
    .from('productos')
    .insert([buildRecord(product, schema)])
    .select(schema.select)
    .single();
  if (error) throw error;
  return normalizeProduct(data);
}

export async function updateProduct(id, product) {
  const schema = await getSchema();
  const { error } = await getSupabase()
    .from('productos')
    .update(buildRecord(product, schema))
    .eq('id', Number(id));
  if (error) throw error;
}

export async function deleteProduct(id) {
  const { error } = await getSupabase()
    .from('productos')
    .delete()
    .eq('id', Number(id));
  if (error) throw error;
}

// ── Orders ──
export async function fetchOrders(negocioId = null) {
  let query = getSupabase()
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (negocioId) query = query.eq('negocio_id', negocioId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveOrder(payload) {
  const { data, error } = await getSupabase()
    .from('pedidos')
    .insert([payload])
    .select('id');
  if (error) throw error;
  return data?.[0]?.id;
}

export async function updateOrderStatus(id, status) {
  const { error } = await getSupabase()
    .from('pedidos')
    .update({ estado: status, status })
    .eq('id', id);
  if (error) throw error;
}

// ── Auth ──
export async function signIn(email, password) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signUp(email, password) {
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

export async function getSession() {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

// ── Register Business ──
export async function registerBusiness({ email, password, businessName, phone }) {
  const { data: authData, error: authError } = await getSupabase().auth.signUp({ email, password });
  if (authError) throw authError;

  const slug = businessName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const { data: negocio, error: negocioError } = await getSupabase()
    .from('negocios')
    .insert({ nombre: slug, nombre_visible: businessName, telefono: phone, user_id: authData.user.id })
    .select()
    .single();
  if (negocioError) throw negocioError;

  return { user: authData.user, negocio };
}

// ── Storage ──
export async function uploadImage(file, path) {
  const { error } = await getSupabase().storage
    .from(SUPABASE_PRODUCT_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = getSupabase().storage.from(SUPABASE_PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ── Realtime ──
export function subscribeToOrders(callback) {
  return getSupabase()
    .channel('orders-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, callback)
    .subscribe();
}

export function subscribeToProducts(callback) {
  return getSupabase()
    .channel('products-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, callback)
    .subscribe();
}

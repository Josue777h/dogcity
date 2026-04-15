import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_PRODUCT_BUCKET, 
  PRODUCT_SCHEMA_VARIANTS, 
  DEFAULT_IMAGE, 
  DOGCITY_MENU_PRODUCTS 
} from './constants.js';
import { sanitizeFileName, getFileExtension } from './utils.js';

let supabaseClient = null;
let productSchemaCache = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  if (!window.supabase?.createClient) {
    throw new Error('No se cargó supabase-js. Verifica el script CDN.');
  }
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_PROJECT')) {
    throw new Error('Configura SUPABASE_URL y SUPABASE_ANON_KEY.');
  }
  
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

export async function detectProductSchema() {
  const supabase = getSupabaseClient();
  let lastError = null;

  for (const variant of PRODUCT_SCHEMA_VARIANTS) {
    const { error } = await supabase
      .from('productos')
      .select(variant.select)
      .limit(1);

    if (!error) {
      productSchemaCache = variant;
      return variant;
    }
    lastError = error;
  }

  throw new Error(`No se pudo detectar la estructura de la tabla productos: ${lastError?.message || 'error desconocido'}`);
}

export async function getProductSchema(forceRefresh = false) {
  if (!forceRefresh && productSchemaCache) return productSchemaCache;
  return detectProductSchema();
}

export function buildProductRecord(product, schema) {
  const record = {};
  if (schema.fields.name) record[schema.fields.name] = product.name;
  if (schema.fields.price) record[schema.fields.price] = Number(product.price);
  if (schema.fields.description) record[schema.fields.description] = product.description;
  if (schema.fields.unit) record[schema.fields.unit] = product.unit || 'unidad';
  if (schema.fields.image) record[schema.fields.image] = product.image || DEFAULT_IMAGE;
  if (schema.fields.category) record[schema.fields.category] = product.categoria || 'Varios';
  if (schema.fields.available) record[schema.fields.available] = product.disponible !== false;
  return record;
}

export function normalizeProductRow(row) {
  return {
    id: Number(row.id),
    name: row.nombre || row.name || 'Producto',
    price: Number(row.precio ?? row.price ?? 0),
    description: row.descripcion || row.description || '',
    unit: row.unidad || row.unit || 'unidad',
    image: row.imagen || row.image || DEFAULT_IMAGE,
    categoria: row.categoria || row.category || 'Varios',
    disponible: row.disponible ?? row.available ?? true
  };
}

export async function loadProducts() {
  const supabase = getSupabaseClient();
  const schema = await getProductSchema();
  
  try {
    const { data, error } = await supabase
      .from('productos')
      .select(schema.select)
      .order('id', { ascending: false });

    if (error) throw error;
    
    const products = (data || []).map(normalizeProductRow);
    
    if (products.length > 0) {
      try {
        localStorage.setItem('dogcity_products_cache', JSON.stringify(products));
        localStorage.setItem('dogcity_cache_time', Date.now().toString());
      } catch (e) {}
      return products;
    }
  } catch (error) {
    try {
      const cached = localStorage.getItem('dogcity_products_cache');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
  }
  
  return DOGCITY_MENU_PRODUCTS.map((product, index) => ({
    id: -(index + 1),
    ...product
  }));
}

export async function uploadProductImage(file, productName) {
  if (!file) throw new Error('No se seleccionó ninguna imagen.');

  const supabase = getSupabaseClient();
  const extension = getFileExtension(file);
  const safeName = sanitizeFileName(productName);
  const uniqueId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filePath = `products/${safeName}-${uniqueId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_PRODUCT_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    });

  if (uploadError) throw new Error(`No se pudo subir la imagen: ${uploadError.message}`);

  const { data } = supabase.storage.from(SUPABASE_PRODUCT_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error('No se pudo obtener la URL pública de la imagen.');

  return data.publicUrl;
}

export async function getSupabaseSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(`Error de sesión: ${error.message}`);
  return data.session;
}

export async function signInAdmin(email, password) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Error de inicio de sesión: ${error.message}`);
  return data.session;
}

export async function signOutAdmin() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Error al cerrar sesión: ${error.message}`);
}

export function subscribeToProductsRealtime(onChange) {
  const supabase = getSupabaseClient();
  return supabase
    .channel(`productos-realtime-${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, payload => onChange(payload))
    .subscribe();
}

export function subscribeToOrdersRealtime(onChange) {
  const supabase = getSupabaseClient();
  return supabase
    .channel(`pedidos-realtime-${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, payload => onChange(payload))
    .subscribe();
}

export async function changeOrderStatus(orderId, newStatus) {
  if (!newStatus) return;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pedidos')
    .update({ estado: newStatus, status: newStatus }) // Mantener ambos por compatibilidad
    .eq('id', orderId)
    .select();
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const supabase = getSupabaseClient();
  const schema = await getProductSchema();
  const { data, error } = await supabase
    .from('productos')
    .insert([buildProductRecord(product, schema)])
    .select(schema.select)
    .single();
  if (error) throw error;
  return normalizeProductRow(data);
}

export async function deleteProduct(productId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('productos')
    .delete()
    .eq('id', Number(productId))
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('No se confirmó la eliminación.');
}

export async function updateProduct(productId, productData) {
  const supabase = getSupabaseClient();
  const schema = await getProductSchema();
  const { data, error } = await supabase
    .from('productos')
    .update(buildProductRecord(productData, schema))
    .eq('id', Number(productId))
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('No se confirmaron los cambios.');
  return true;
}

export async function loadOrders() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function seedDefaultCatalogIfEmpty() {
  const supabase = getSupabaseClient();
  const schema = await getProductSchema();
  const { count, error: countError } = await supabase
    .from('productos')
    .select('id', { count: 'exact', head: true });

  if (countError) throw countError;
  if ((count || 0) > 0) return false;

  const { error } = await supabase
    .from('productos')
    .insert(DOGCITY_MENU_PRODUCTS.map(product => buildProductRecord(product, schema)));

  if (error) throw error;
  return true;
}

export async function saveOrderToSupabase(payload) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pedidos')
    .insert([payload])
    .select('id');
  if (error) throw error;
  return data?.[0]?.id;
}

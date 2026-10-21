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

  // Serializar opciones limpiamente en la descripción si hay grupos configurados
  let finalDescription = (product.description || '').trim();
  const opciones = Array.isArray(product.opciones) ? product.opciones : [];
  if (opciones.length > 0) {
    finalDescription = `${finalDescription}\n<!--NEGU_OPTIONS:${JSON.stringify(opciones)}-->`;
  }
  if (schema.fields.description) record[schema.fields.description] = finalDescription;

  if (schema.fields.unit) record[schema.fields.unit] = product.unit || 'unidad';
  if (schema.fields.image) record[schema.fields.image] = product.image || DEFAULT_IMAGE;
  if (schema.fields.category) record[schema.fields.category] = product.categoria || 'Varios';
  if (schema.fields.available) record[schema.fields.available] = product.disponible !== false;
  if (product.negocio_id) record.negocio_id = product.negocio_id;
  if (product.categoria_id) record.categoria_id = product.categoria_id;
  if (schema.fields.opciones) record[schema.fields.opciones] = opciones;
  return record;
}

function normalizeProduct(row) {
  let description = row.descripcion || row.description || '';
  let opciones = [];

  if (row.opciones && Array.isArray(row.opciones)) {
    opciones = row.opciones;
  } else if (typeof description === 'string' && /<!--(?:NEGU|CAMLY)_OPTIONS:/.test(description)) {
    try {
      const match = description.match(/<!--(?:NEGU|CAMLY)_OPTIONS:(.*?)-->/s);
      if (match && match[1]) {
        opciones = JSON.parse(match[1]);
        description = description.replace(/<!--(?:NEGU|CAMLY)_OPTIONS:(.*?)-->/s, '').trim();
      }
    } catch (e) {
      console.warn('Error parsing product options:', e);
    }
  }

  return {
    id: Number(row.id),
    name: row.nombre || row.name || 'Producto',
    price: Number(row.precio ?? row.price ?? 0),
    description,
    raw_description: row.descripcion || row.description || '',
    unit: row.unidad || row.unit || 'unidad',
    image: row.imagen || row.image || DEFAULT_IMAGE,
    categoria: row.categoria || row.category || 'Varios',
    categoria_id: row.categoria_id || null,
    disponible: row.disponible ?? row.available ?? true,
    negocio_id: row.negocio_id,
    opciones: Array.isArray(opciones) ? opciones : [],
  };
}

// ── Categories ──
export async function fetchCategories(negocioId) {
  if (!negocioId) return [];
  const { data, error } = await getSupabase()
    .from('categorias')
    .select('*')
    .eq('negocio_id', negocioId)
    .order('nombre', { ascending: true });
  if (error) {
    if (error.code === '42P01') return []; // Relation does not exist yet
    throw error;
  }
  return data || [];
}

export async function createCategory(payload) {
  const { data, error } = await getSupabase()
    .from('categorias')
    .insert([{ ...payload, nombre: payload.nombre.trim() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, updates) {
  const { error } = await getSupabase()
    .from('categorias')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id) {
  const { error } = await getSupabase()
    .from('categorias')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Business (Negocio) ──
const PUBLIC_BUSINESS_FIELDS = 'id,nombre,nombre_visible,telefono,whatsapp_contacto,direccion,theme_color,color_secundario,instagram,facebook,tiktok,footer_message,pago_banco,pago_alias,metodos_pago,lat,lng,tipo_domicilio,costo_por_km,domicilio_minimo,precio_domicilio,logo_url,business_type,horario,catalog_design,timezone';
// Compatible con proyectos Supabase que aún no ejecutan las columnas nuevas de configuración.
const LEGACY_PUBLIC_BUSINESS_FIELDS = 'id,nombre,nombre_visible,telefono,whatsapp_contacto,direccion,theme_color,color_secundario,instagram,facebook,tiktok,footer_message,pago_banco,pago_alias,metodos_pago,lat,lng,tipo_domicilio,costo_por_km,domicilio_minimo,precio_domicilio,logo_url,business_type';

export async function fetchBusiness(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).trim();
  const normalizedSpaces = cleanSlug.replace(/-/g, ' ');

  try {
    const fetchMatch = async (column, value, exact = false) => {
      const runQuery = fields => {
        const base = getSupabase().from('negocios').select(fields);
        return (exact ? base.eq(column, value) : base.ilike(column, value)).maybeSingle();
      };
      let result = await runQuery(PUBLIC_BUSINESS_FIELDS);
      if (result.error) {
        const legacyResult = await runQuery(LEGACY_PUBLIC_BUSINESS_FIELDS);
        if (!legacyResult.error) return legacyResult;
      }
      return result;
    };

    // 1. Intento exacto por nombre
    let { data, error } = await fetchMatch('nombre', cleanSlug, true);
    if (error) throw error;

    // 2. Intento insensible a mayúsculas
    if (!data) {
      const res = await fetchMatch('nombre', cleanSlug);
      if (res.error) throw res.error;
      data = res.data;
    }

    // 3. Intento reemplazando guiones por espacios
    if (!data && cleanSlug.includes('-')) {
      const res = await fetchMatch('nombre', normalizedSpaces);
      if (res.error) throw res.error;
      data = res.data;
    }

    // 4. Intento por nombre visible
    if (!data) {
      const res = await fetchMatch('nombre_visible', `%${cleanSlug}%`);
      if (res.error) throw res.error;
      data = res.data;
    }

    if (!data) return null;

    return {
      ...data,
      metodos_pago: Array.isArray(data.metodos_pago) ? data.metodos_pago : ['efectivo', 'transferencia']
    };
  } catch (err) {
    console.error('Error fetchBusiness:', err);
    return null;
  }
}

const OPTIONAL_BUSINESS_COLUMNS = new Set(['business_type', 'catalog_design', 'horario', 'timezone']);

export async function updateBusiness(id, updates) {
  const payload = { ...updates };

  while (true) {
    const { data, error } = await getSupabase()
      .from('negocios')
      .update(payload)
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (!error) return data;

    const missingColumn = [...OPTIONAL_BUSINESS_COLUMNS].find(column =>
      error.message?.includes(`'${column}'`)
      || error.message?.includes(`"${column}"`)
      || new RegExp(`\\bcolumn\\s+${column}\\b`, 'i').test(error.message || '')
    );
    const isMissingColumn = ['PGRST204', '42703'].includes(error.code);

    if (!isMissingColumn || !missingColumn || !OPTIONAL_BUSINESS_COLUMNS.has(missingColumn) || !(missingColumn in payload)) {
      throw error;
    }

    delete payload[missingColumn];
  }
}

export async function fetchSubscription(negocioId) {
  const { data, error } = await getSupabase()
    .from('suscripciones')
    .select('*')
    .eq('negocio_id', negocioId)
    .single();
  
  if (error) {
     console.error('Error fetchSubscription:', error);
     return null;
  }
  
  // Auto-expiración lógica
  if (data && data.fecha_fin && (data.estado === 'trial' || data.estado === 'activo')) {
    const isExpired = new Date(data.fecha_fin) < new Date();
    if (isExpired) {
      data.estado = 'vencido';
      data.es_trial = false;
      // Actualizar en base de datos 
      await getSupabase().from('suscripciones').update({ estado: 'vencido', es_trial: false }).eq('id', data.id);
    }
  }

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

export async function confirmOrderDelivery(id, domicilioCosto, newTotal) {
  const { error } = await getSupabase()
    .from('pedidos')
    .update({
      domicilio_costo: domicilioCosto,
      total: newTotal,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteOrder(id) {
  const { data, error } = await getSupabase()
    .from('pedidos')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se eliminó el pedido. Verifica que pertenezca a tu negocio y que la política DELETE esté instalada en Supabase.');
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
export async function registerBusiness({ email, password, businessName, phone, storeSlug }) {
  const slug = String(storeSlug || businessName).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 35);
  if (!slug) throw new Error('El enlace de la tienda no es válido.');
  const { data: existingStore, error: lookupError } = await getSupabase()
    .from('negocios').select('id').eq('nombre', slug).maybeSingle();
  if (lookupError) throw lookupError;
  if (existingStore) throw new Error('Ese enlace ya está en uso. Elige otro nombre para tu tienda.');
  const { data: authData, error: authError } = await getSupabase().auth.signUp({ email, password });
  if (authError) throw authError;
  const { data: negocio, error: negocioError } = await getSupabase()
    .from('negocios')
    .insert({ 
      nombre: slug, 
      nombre_visible: businessName, 
      telefono: phone, 
      user_id: authData.user.id,
      theme_color: '#2563EB',
      color_secundario: '#F9FAFB',
      // A new store has no bank or wallet details yet, so only enable cash.
      metodos_pago: ['efectivo']
    })
    .select()
    .single();
  if (negocioError) throw negocioError;

  // Insertar Suscripción Trial (7 días) automáticamente (usando upsert por si ya existe creada por trigger)
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const { error: subError } = await getSupabase()
    .from('suscripciones')
    .upsert({
      negocio_id: negocio.id,
      plan: 'pro',
      estado: 'trial',
      fecha_fin: d.toISOString(),
      es_trial: true
    }, { onConflict: 'negocio_id' });
    
  if (subError) {
    console.error("Error creando/actualizando la suscripción:", subError);
  }

  return { user: authData.user, session: authData.session, negocio };
}

// ── Storage ──
export async function uploadImage(file, path) {
  // Sanitize path to prevent 'Invalid Key' 400 errors from Supabase
  const sanitizedPath = path.split('/').map(segment => 
    segment.normalize('NFD') // Decompose accented characters
           .replace(/[\u0300-\u036f]/g, '') // Remove accents
           .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace spaces/special chars with underscore
  ).join('/');

  const { error } = await getSupabase().storage
    .from(SUPABASE_PRODUCT_BUCKET)
    .upload(sanitizedPath, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  
  const { data } = getSupabase().storage.from(SUPABASE_PRODUCT_BUCKET).getPublicUrl(sanitizedPath);
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

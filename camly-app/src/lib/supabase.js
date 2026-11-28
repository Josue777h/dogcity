import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, PRODUCT_SCHEMA_VARIANTS, DEFAULT_IMAGE, SUPABASE_PRODUCT_BUCKET } from './constants';
import { getVerticalById } from './modules';

// ── Singleton client ──
let client = null;
export function getSupabase() {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        lock: async (_name, _acquireTimeout, fn) => await fn(),
      },
    });
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
  const numericPrice = Number(product.price) || 0;
  if (schema.fields.price) record[schema.fields.price] = numericPrice;

  // Limpiar cualquier tag previo antes de serializar
  let finalDescription = String(product.description || '')
    .replace(/<!--(?:NEGU|CAMLY)_OPTIONS:[\s\S]*?-->/g, '')
    .replace(/<!--NEGU_META:[\s\S]*?-->/g, '')
    .trim();

  const opciones = Array.isArray(product.opciones) ? product.opciones : [];
  if (opciones.length > 0) {
    finalDescription = `${finalDescription}\n<!--NEGU_OPTIONS:${JSON.stringify(opciones)}-->`.trim();
  }

  // Serializar metadatos opcionales (precio anterior / stock) con compatibilidad hacia atrás
  const rawCompare = product.comparePrice ?? product.precio_anterior ?? null;
  const parsedCompare = rawCompare === '' || rawCompare === null || rawCompare === undefined ? null : Number(rawCompare);
  const validCompare = Number.isFinite(parsedCompare) && parsedCompare > numericPrice ? parsedCompare : null;

  const rawStock = product.stock;
  const parsedStock = rawStock === '' || rawStock === null || rawStock === undefined ? null : Math.max(0, Math.floor(Number(rawStock)));
  const validStock = parsedStock !== null && Number.isFinite(parsedStock) ? parsedStock : null;

  const meta = {};
  if (validCompare !== null) meta.comparePrice = validCompare;
  if (validStock !== null) meta.stock = validStock;

  // Galería adicional (hasta 3 fotos extra además de la principal)
  const primaryImg = product.image || DEFAULT_IMAGE;
  const extraImages = Array.isArray(product.images)
    ? [...new Set(product.images.filter(u => typeof u === 'string' && u.trim() && u !== primaryImg && u !== DEFAULT_IMAGE))].slice(0, 3)
    : [];
  if (extraImages.length > 0) meta.images = extraImages;

  if (Object.keys(meta).length > 0) {
    finalDescription = `${finalDescription}\n<!--NEGU_META:${JSON.stringify(meta)}-->`.trim();
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
  let meta = {};

  if (typeof description === 'string' && /<!--NEGU_META:/.test(description)) {
    try {
      const metaMatch = description.match(/<!--NEGU_META:(.*?)-->/s);
      if (metaMatch && metaMatch[1]) {
        meta = JSON.parse(metaMatch[1]) || {};
      }
      description = description.replace(/<!--NEGU_META:[\s\S]*?-->/g, '').trim();
    } catch (e) {
      console.warn('Error parsing product meta:', e);
    }
  }

  if (row.opciones && Array.isArray(row.opciones)) {
    opciones = row.opciones;
    description = description.replace(/<!--(?:NEGU|CAMLY)_OPTIONS:[\s\S]*?-->/g, '').trim();
  } else if (typeof description === 'string' && /<!--(?:NEGU|CAMLY)_OPTIONS:/.test(description)) {
    try {
      const match = description.match(/<!--(?:NEGU|CAMLY)_OPTIONS:(.*?)-->/s);
      if (match && match[1]) {
        opciones = JSON.parse(match[1]);
        description = description.replace(/<!--(?:NEGU|CAMLY)_OPTIONS:[\s\S]*?-->/g, '').trim();
      }
    } catch (e) {
      console.warn('Error parsing product options:', e);
    }
  }

  const price = Number(row.precio ?? row.price ?? 0);
  const rawCompare = row.precio_anterior ?? meta.comparePrice ?? null;
  const compareNum = rawCompare === null || rawCompare === '' ? null : Number(rawCompare);
  const comparePrice = Number.isFinite(compareNum) && compareNum > price ? compareNum : null;

  const rawStock = row.stock ?? meta.stock ?? null;
  const stockNum = rawStock === null || rawStock === '' ? null : Math.max(0, Math.floor(Number(rawStock)));
  const stock = stockNum !== null && Number.isFinite(stockNum) ? stockNum : null;

  const primaryImage = row.imagen || row.image || DEFAULT_IMAGE;
  const extraImages = Array.isArray(meta.images)
    ? meta.images.filter(u => typeof u === 'string' && u.trim() && u !== primaryImage && u !== DEFAULT_IMAGE).slice(0, 3)
    : [];
  const allImages = primaryImage && primaryImage !== DEFAULT_IMAGE
    ? [primaryImage, ...extraImages]
    : extraImages;

  return {
    id: Number(row.id),
    name: row.nombre || row.name || 'Producto',
    price,
    comparePrice,
    stock,
    description,
    raw_description: row.descripcion || row.description || '',
    unit: row.unidad || row.unit || 'unidad',
    image: primaryImage,
    images: allImages,
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
    .select('id,nombre,negocio_id')
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

export async function updateCategory(id, updates, negocioId = null) {
  let query = getSupabase()
    .from('categorias')
    .update(updates)
    .eq('id', id);
  if (negocioId) query = query.eq('negocio_id', negocioId);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteCategory(id, negocioId = null) {
  let query = getSupabase()
    .from('categorias')
    .delete()
    .eq('id', id);
  if (negocioId) query = query.eq('negocio_id', negocioId);
  const { error } = await query;
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

const OPTIONAL_BUSINESS_COLUMNS = new Set(['business_type', 'catalog_design', 'horario', 'timezone', 'color_secundario']);

export async function updateBusiness(id, updates) {
  const payload = { ...updates };
  let encodedFooterMessage = payload.footer_message !== undefined ? payload.footer_message : null;

  while (true) {
    const { data, error } = await getSupabase()
      .from('negocios')
      .update(payload)
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (!error) return data || { id };

    const missingColumn = [...OPTIONAL_BUSINESS_COLUMNS].find(column =>
      error.message?.includes(`'${column}'`)
      || error.message?.includes(`"${column}"`)
      || new RegExp(`\\bcolumn\\s+${column}\\b`, 'i').test(error.message || '')
    );
    const isMissingColumn = ['PGRST204', '42703', 'PGRST200'].includes(error.code) || /column.*(?:not found|does not exist)/i.test(error.message || '');

    if (!isMissingColumn || !missingColumn || !OPTIONAL_BUSINESS_COLUMNS.has(missingColumn) || !(missingColumn in payload)) {
      throw error;
    }

    if (missingColumn === 'horario' && payload.horario) {
      const scheduleTag = `<!--NEGU_SCHEDULE:${JSON.stringify(payload.horario)}-->`;
      if (encodedFooterMessage === null) {
        const { data: cur } = await getSupabase().from('negocios').select('footer_message').eq('id', id).maybeSingle();
        encodedFooterMessage = cur?.footer_message || '';
      }
      encodedFooterMessage = encodedFooterMessage.replace(/<!--(?:NEGU|CAMLY)_SCHEDULE:[\s\S]*?-->/g, '').trim();
      encodedFooterMessage = `${encodedFooterMessage} ${scheduleTag}`.trim();
      payload.footer_message = encodedFooterMessage;
    }

    if (missingColumn === 'catalog_design' && payload.catalog_design) {
      const designTag = `<!--NEGU_DESIGN:${JSON.stringify(payload.catalog_design)}-->`;
      if (encodedFooterMessage === null) {
        const { data: cur } = await getSupabase().from('negocios').select('footer_message').eq('id', id).maybeSingle();
        encodedFooterMessage = cur?.footer_message || '';
      }
      encodedFooterMessage = encodedFooterMessage.replace(/<!--(?:NEGU|CAMLY)_DESIGN:[\s\S]*?-->/g, '').trim();
      encodedFooterMessage = `${encodedFooterMessage} ${designTag}`.trim();
      payload.footer_message = encodedFooterMessage;
    }

    delete payload[missingColumn];
  }
}

export async function fetchSubscription(negocioId) {
  const { data, error } = await getSupabase()
    .from('suscripciones')
    .select('id,negocio_id,plan,estado,es_trial,fecha_inicio,fecha_fin,updated_at')
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
      await getSupabase().rpc('mark_subscription_expired', { p_negocio_id: negocioId });
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

export async function updateProduct(id, product, negocioId = null) {
  const schema = await getSchema();
  const targetBizId = negocioId || product?.negocio_id || null;
  let query = getSupabase()
    .from('productos')
    .update(buildRecord(product, schema))
    .eq('id', Number(id));
  if (targetBizId) query = query.eq('negocio_id', targetBizId);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteProduct(id, negocioId = null) {
  let query = getSupabase()
    .from('productos')
    .delete()
    .eq('id', Number(id));
  if (negocioId) query = query.eq('negocio_id', negocioId);
  const { error } = await query;
  if (error) throw error;
}

/**
 * Descuenta o repone stock de forma segura e idempotente al confirmar/cancelar un pedido.
 * Solo afecta productos con control numérico de stock configurado (`stock !== null`).
 */
export async function adjustStockForOrder(order, products = [], businessId = null, direction = 'deduct') {
  if (!order?.id || !businessId || !Array.isArray(products) || products.length === 0) {
    return { changedCount: 0, totalUnits: 0 };
  }

  const ledgerKey = `negu_stock_ledger_${businessId}`;
  let ledger = {};
  try {
    ledger = JSON.parse(localStorage.getItem(ledgerKey) || '{}') || {};
  } catch {
    ledger = {};
  }

  const orderKey = String(order.id);
  const alreadyDeducted = ledger[orderKey] === 'deducted';

  if (direction === 'deduct' && alreadyDeducted) {
    return { changedCount: 0, totalUnits: 0 };
  }
  if (direction === 'restore' && !alreadyDeducted) {
    return { changedCount: 0, totalUnits: 0 };
  }

  const rawItems = order.items || order.productos || [];
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { changedCount: 0, totalUnits: 0 };
  }

  // Agrupar cantidades por producto
  const qtyByProductId = new Map();
  for (const item of rawItems) {
    const qty = Math.max(0, Math.floor(Number(item.cantidad ?? item.quantity ?? 1) || 0));
    if (qty <= 0) continue;

    const itemPid = item.id ?? item.productId ?? item.producto_id;
    let matched = itemPid !== undefined && itemPid !== null
      ? products.find(p => String(p.id) === String(itemPid))
      : null;
    if (!matched && (item.nombre || item.name)) {
      const targetName = String(item.nombre || item.name).trim().toLowerCase();
      matched = products.find(p => String(p.name || '').trim().toLowerCase() === targetName) || null;
    }
    if (!matched) continue;
    if (matched.stock === null || matched.stock === undefined) continue;

    qtyByProductId.set(matched.id, (qtyByProductId.get(matched.id) || 0) + qty);
  }

  if (qtyByProductId.size === 0) {
    return { changedCount: 0, totalUnits: 0 };
  }

  let changedCount = 0;
  let totalUnits = 0;

  for (const [productId, qty] of qtyByProductId.entries()) {
    const prod = products.find(p => p.id === productId);
    if (!prod || prod.stock === null || prod.stock === undefined) continue;

    const currentStock = Math.max(0, Math.floor(Number(prod.stock) || 0));
    const nextStock = direction === 'deduct'
      ? Math.max(0, currentStock - qty)
      : currentStock + qty;

    if (nextStock === currentStock) continue;

    await updateProduct(
      prod.id,
      {
        ...prod,
        stock: nextStock,
        disponible: nextStock > 0 ? (direction === 'restore' ? true : prod.disponible) : false,
      },
      businessId
    );
    changedCount += 1;
    totalUnits += qty;
  }

  if (changedCount > 0) {
    try {
      if (direction === 'deduct') {
        ledger[orderKey] = 'deducted';
      } else {
        delete ledger[orderKey];
      }
      // Mantener el registro ligero (últimos 300 pedidos)
      const keys = Object.keys(ledger);
      if (keys.length > 300) {
        keys.slice(0, keys.length - 300).forEach(k => delete ledger[k]);
      }
      localStorage.setItem(ledgerKey, JSON.stringify(ledger));
    } catch {
      // ignore storage errors
    }
  }

  return { changedCount, totalUnits };
}

// ── Orders ──
export async function fetchOrders(negocioId = null, limit = 500) {
  let query = getSupabase()
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });
  if (Number(limit) > 0) query = query.limit(Number(limit));
  if (negocioId) query = query.eq('negocio_id', negocioId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveOrder(rawPayload) {
  const sb = getSupabase();
  const payload = { ...rawPayload };

  // Validación e integridad de precios contra manipulación en el navegador
  try {
    if (payload.negocio_id && Array.isArray(payload.items) && payload.items.length > 0) {
      const dbProducts = await fetchProducts(payload.negocio_id);
      const prodMap = new Map(dbProducts.map(p => [Number(p.id), p]));

      let verifiedSubtotal = 0;
      payload.items = payload.items.map(item => {
        const qty = Math.max(1, Math.min(999, Math.floor(Number(item.cantidad ?? item.quantity ?? 1))));
        const dbProd = prodMap.get(Number(item.id || item.productId));
        if (dbProd) {
          const basePrice = Math.max(0, Number(dbProd.price || 0));
          // Verificar costo de opciones/toppings contra las opciones reales del producto
          const validOptsMap = new Map();
          (dbProd.opciones || []).forEach(g => {
            (g.opciones || []).forEach(o => {
              validOptsMap.set(String(o.id || o.nombre), Math.max(0, Number(o.precio || 0)));
            });
          });
          const itemOpts = Array.isArray(item.opciones) ? item.opciones : (Array.isArray(item.options) ? item.options : []);
          const optsExtra = itemOpts.reduce((acc, o) => {
            const key = String(o.id || o.nombre || '');
            const realOptPrice = validOptsMap.has(key) ? validOptsMap.get(key) : Math.max(0, Number(o.precio || 0));
            return acc + realOptPrice;
          }, 0);
          const realUnitPrice = basePrice + optsExtra;
          verifiedSubtotal += realUnitPrice * qty;
          return {
            ...item,
            cantidad: qty,
            precio: realUnitPrice,
            precio_base: basePrice,
          };
        }
        const fallbackPrice = Math.max(0, Number(item.precio ?? item.price ?? 0));
        verifiedSubtotal += fallbackPrice * qty;
        return { ...item, cantidad: qty, precio: fallbackPrice };
      });

      const safeDeliveryCost = Math.max(0, Number(payload.domicilio_costo ?? payload.delivery_fee ?? 0));
      payload.subtotal_amount = verifiedSubtotal;
      delete payload.subtotal;
      payload.total = verifiedSubtotal + safeDeliveryCost;
      payload.total_amount = payload.total;
    }
  } catch (verifyErr) {
    console.warn('Advertencia verificando precios de orden:', verifyErr);
  }

  // 1. Intentar primero con la función RPC segura (SECURITY DEFINER)
  // Es la opción preferida porque elude restricciones de SELECT en RLS para clientes anónimos
  try {
    const { data: rpcData, error: rpcError } = await sb.rpc('customer_create_order', {
      p_order: payload,
    });
    if (!rpcError && (rpcData?.id || typeof rpcData === 'number')) {
      return rpcData?.id || rpcData;
    }
    if (rpcError && rpcError.code !== 'PGRST202' && rpcError.code !== '42883') {
      console.warn('RPC customer_create_order reportó un error, intentando inserción directa:', rpcError);
    }
  } catch (rpcErr) {
    console.warn('RPC customer_create_order no disponible, usando fallback directo:', rpcErr);
  }

  // 2. Inserción directa (fallback estándar)
  const { data, error } = await sb
    .from('pedidos')
    .insert([payload])
    .select('id');

  if (error) {
    // Si falla por política de RLS (PostgreSQL error 42501 al evaluar RETURNING con usuario anon)
    if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
      console.warn('RLS bloqueó .select("id"). Intentando inserción directa sin select...');
      const insertOnly = await sb.from('pedidos').insert([payload]);
      if (insertOnly.error) throw insertOnly.error;

      // Si se insertó exitosamente sin .select(), intentar obtener el ID mediante el token único
      if (payload?.token) {
        const { data: byToken } = await sb
          .from('pedidos')
          .select('id')
          .eq('token', payload.token)
          .maybeSingle();
        if (byToken?.id) return byToken.id;
      }
      throw new Error('No se pudo confirmar el ID del pedido. Verifica que la función customer_create_order esté desplegada.');
    }
    throw error;
  }

  return data?.[0]?.id;
}

export async function updateOrderStatus(id, status, negocioId = null) {
  let query = getSupabase()
    .from('pedidos')
    .update({ estado: status, status })
    .eq('id', id);
  if (negocioId) query = query.eq('negocio_id', negocioId);
  const { error } = await query;
  if (error) throw error;
}

export async function updateOrderRecord(id, updates, negocioId = null) {
  const sb = getSupabase();
  const payload = { ...updates };
  const optionalCols = ['total_amount', 'subtotal_amount', 'productos'];

  while (true) {
    let query = sb.from('pedidos').update(payload).eq('id', id);
    if (negocioId) query = query.eq('negocio_id', negocioId);
    const { error } = await query;
    if (!error) return true;

    const missingCol = optionalCols.find(col =>
      (col in payload) && (
        error.message?.includes(`'${col}'`) ||
        error.message?.includes(`"${col}"`) ||
        new RegExp(`\\bcolumn\\s+${col}\\b`, 'i').test(error.message || '')
      )
    );
    if (missingCol && ['PGRST204', '42703'].includes(error.code)) {
      delete payload[missingCol];
      continue;
    }
    throw error;
  }
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

export async function resendSignupConfirmation(email) {
  const { error } = await getSupabase().auth.resend({
    type: 'signup',
    email: String(email || '').trim(),
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function requestPasswordRecovery(email) {
  const { error } = await getSupabase().auth.resetPasswordForEmail(String(email || '').trim(), {
    redirectTo: `${window.location.origin}/restablecer-contrasena`,
  });
  if (error) throw error;
}

export async function updateAccountPassword(password) {
  const { data, error } = await getSupabase().auth.updateUser({ password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

export async function getSession() {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

async function createBusinessForUser(user) {
  const supabase = getSupabase();
  const { data: existingBusiness, error: lookupError } = await supabase
    .from('negocios')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existingBusiness) return existingBusiness;

  const metadata = user.user_metadata || {};
  const baseSlug = String(metadata.negu_store_slug || metadata.negu_business_name || '')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 35);
  let slug = baseSlug;
  const businessName = String(metadata.negu_business_name || '').trim();
  const phone = String(metadata.negu_business_phone || '').trim();
  if (!slug || !businessName || !phone) {
    throw new Error('No pudimos recuperar los datos del negocio. Inicia sesión y contacta al soporte de NEGU.');
  }

  const { data: nameInUse, error: nameLookupError } = await supabase
    .from('negocios').select('id').eq('nombre', slug).maybeSingle();
  if (nameLookupError) throw nameLookupError;
  if (nameInUse) {
    slug = `${baseSlug.slice(0, 28)}-${user.id.replace(/-/g, '').slice(0, 6)}`;
    const { data: fallbackInUse, error: fallbackLookupError } = await supabase
      .from('negocios').select('id').eq('nombre', slug).maybeSingle();
    if (fallbackLookupError) throw fallbackLookupError;
    if (fallbackInUse) throw new Error('No pudimos asignar un enlace único a tu tienda. Contacta al soporte para terminar el registro.');
  }

  const vertical = getVerticalById(metadata.negu_vertical_id || metadata.negu_business_type || 'food');
  const insertPayload = {
    nombre: slug,
    nombre_visible: businessName,
    telefono: phone,
    user_id: user.id,
    business_type: vertical.businessType,
    theme_color: vertical.defaultThemeColor,
    color_secundario: vertical.defaultSecondaryColor,
    metodos_pago: ['efectivo', 'transferencia'],
    catalog_design: {
      button_style: 'pill',
      font_family: 'sans',
      footer_style: 'branded',
      vertical_id: vertical.id,
      modules: vertical.modules,
      onboarding: {
        delivery_preference: metadata.negu_delivery_preference || 'ambos',
        experience_level: metadata.negu_experience_level || 'whatsapp_manual',
      },
    },
  };

  let business = null;
  let businessError = null;
  const legacyOptionalCols = ['business_type', 'catalog_design'];
  while (true) {
    const res = await supabase
      .from('negocios')
      .insert(insertPayload)
      .select()
      .single();
    business = res.data;
    businessError = res.error;
    if (!businessError) break;

    const missingCol = legacyOptionalCols.find(col =>
      (col in insertPayload) && (
        businessError.message?.includes(`'${col}'`) ||
        businessError.message?.includes(`"${col}"`) ||
        new RegExp(`\\bcolumn\\s+${col}\\b`, 'i').test(businessError.message || '')
      )
    );
    if (missingCol && ['PGRST204', '42703'].includes(businessError.code)) {
      delete insertPayload[missingCol];
      continue;
    }
    break;
  }

  if (businessError) {
    const { data: concurrentlyCreated, error: retryLookupError } = await supabase
      .from('negocios').select('*').eq('user_id', user.id).maybeSingle();
    if (retryLookupError) throw retryLookupError;
    if (concurrentlyCreated) return concurrentlyCreated;
    throw businessError;
  }

  const { error: subscriptionError } = await supabase.rpc('create_trial_subscription', { p_negocio_id: business.id });
  if (subscriptionError) console.error('Error creando la suscripción inicial:', subscriptionError);

  return business;
}

export async function completePendingBusinessRegistration(session) {
  const user = session?.user;
  if (!user || !(user.email_confirmed_at || user.confirmed_at)) {
    throw new Error('Confirma tu correo antes de continuar al panel.');
  }
  return createBusinessForUser(user);
}

// ── Register Business ──
export async function registerBusiness({
  email,
  password,
  businessName,
  ownerName,
  phone,
  storeSlug,
  verticalId = 'food',
  businessType = 'food',
  deliveryPreference = 'ambos',
  experienceLevel = 'whatsapp_manual',
  legalAcceptances,
}) {
  const slug = String(storeSlug || businessName).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 35);
  if (!slug) throw new Error('El enlace de la tienda no es válido.');
  const { data: existingStore, error: lookupError } = await getSupabase()
    .from('negocios').select('id').eq('nombre', slug).maybeSingle();
  if (lookupError) throw lookupError;
  if (existingStore) throw new Error('Ese enlace ya está en uso. Elige otro nombre para tu tienda.');
  const resolvedVertical = getVerticalById(verticalId || businessType || 'food');
  const { data: authData, error: authError } = await getSupabase().auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: String(ownerName || '').trim(),
        negu_business_name: String(businessName || '').trim(),
        negu_store_slug: slug,
        negu_business_phone: String(phone || '').trim(),
        negu_vertical_id: resolvedVertical.id,
        negu_business_type: resolvedVertical.businessType,
        negu_delivery_preference: deliveryPreference || 'ambos',
        negu_experience_level: experienceLevel || 'whatsapp_manual',
        negu_terms_accepted_at: legalAcceptances?.acceptedAt || null,
        negu_terms_version: legalAcceptances?.termsVersion || null,
        negu_privacy_accepted_at: legalAcceptances?.acceptedAt || null,
        negu_privacy_version: legalAcceptances?.privacyVersion || null,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (authError) throw authError;
  if (!authData.session) {
    return { user: authData.user, session: null, negocio: null, needsEmailConfirmation: true };
  }

  const negocio = await createBusinessForUser(authData.user);
  return { user: authData.user, session: authData.session, negocio, needsEmailConfirmation: false };
}

// ── Storage ──
async function convertImageFileToWebp(file, { maxDimension = 1200, quality = 0.85 } = {}) {
  if (
    typeof document === 'undefined' ||
    !file?.type?.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return { file, ext: null };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const srcWidth = img.naturalWidth || img.width;
        const srcHeight = img.naturalHeight || img.height;
        if (!srcWidth || !srcHeight) {
          URL.revokeObjectURL(objectUrl);
          resolve({ file, ext: null });
          return;
        }

        const scale = Math.min(1, maxDimension / Math.max(srcWidth, srcHeight));
        const targetWidth = Math.max(1, Math.round(srcWidth * scale));
        const targetHeight = Math.max(1, Math.round(srcHeight * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve({ file, ext: null });
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob || blob.type !== 'image/webp') {
              resolve({ file, ext: null });
              return;
            }
            const baseName = String(file.name || 'imagen').replace(/\.[^.]+$/, '') || 'imagen';
            const webpFile = new File([blob], `${baseName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve({ file: webpFile, ext: 'webp' });
          },
          'image/webp',
          quality
        );
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve({ file, ext: null });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, ext: null });
    };

    img.src = objectUrl;
  });
}

export async function uploadImage(file, path) {
  // Sanitize path to prevent 'Invalid Key' 400 errors from Supabase
  let sanitizedPath = path.split('/').map(segment => 
    segment.normalize('NFD') // Decompose accented characters
           .replace(/[\u0300-\u036f]/g, '') // Remove accents
           .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace spaces/special chars with underscore
  ).join('/');

  const maxDimension = String(path || '').startsWith('logos/') ? 600 : 1200;
  const { file: convertedFile, ext } = await convertImageFileToWebp(file, { maxDimension, quality: 0.85 });
  const processedFile = convertedFile || file;

  if (ext === 'webp') {
    sanitizedPath = /\.[a-zA-Z0-9]+$/.test(sanitizedPath)
      ? sanitizedPath.replace(/\.[a-zA-Z0-9]+$/, '.webp')
      : `${sanitizedPath}.webp`;
  }

  if (processedFile.size > 2 * 1024 * 1024) {
    throw new Error('La imagen optimizada supera el límite de 2MB. Intenta con otra imagen más pequeña.');
  }

  const { error } = await getSupabase().storage
    .from(SUPABASE_PRODUCT_BUCKET)
    .upload(sanitizedPath, processedFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: processedFile.type || 'image/webp',
    });
  if (error) throw error;
  
  const { data } = getSupabase().storage.from(SUPABASE_PRODUCT_BUCKET).getPublicUrl(sanitizedPath);
  return data.publicUrl;
}

// ── Realtime ──
export function subscribeToOrders(callback, negocioId = null) {
  const channelName = negocioId ? `orders-realtime-${negocioId}` : 'orders-realtime';
  const pgConfig = negocioId
    ? { event: '*', schema: 'public', table: 'pedidos', filter: `negocio_id=eq.${negocioId}` }
    : { event: '*', schema: 'public', table: 'pedidos' };
  return getSupabase()
    .channel(channelName)
    .on('postgres_changes', pgConfig, callback)
    .subscribe();
}

const tableCallSubscriptions = new Map();

export function emitTableCallEvent(businessId, payload) {
  if (typeof window !== 'undefined') {
    try {
      const bc = new BroadcastChannel('negu_orders_channel');
      bc.postMessage(payload);
      setTimeout(() => bc.close(), 500);
    } catch (err) {
      console.debug('BroadcastChannel no disponible:', err);
    }

    try {
      if (payload?.type === 'CALL_WAITER') {
        localStorage.setItem('negu_table_call_event', JSON.stringify(payload));
      } else if (payload?.type === 'RESOLVE_WAITER_CALL' && payload?.mesa) {
        const stored = localStorage.getItem('negu_active_table_calls');
        if (stored) {
          const parsed = JSON.parse(stored);
          delete parsed[String(payload.mesa)];
          localStorage.setItem('negu_active_table_calls', JSON.stringify(parsed));
        }
        localStorage.removeItem('negu_table_call_event');
      }
    } catch (err) {
      console.debug('localStorage no disponible:', err);
    }
  }

  if (!businessId) return;

  try {
    const sb = getSupabase();
    const shared = tableCallSubscriptions.get(businessId);
    const sendPayload = (ch) => ch.send({
      type: 'broadcast',
      event: payload?.type || 'TABLE_EVENT',
      payload,
    });

    if (shared?.channel) {
      sendPayload(shared.channel);
      return;
    }

    const channel = sb.channel(`negu-table-calls-${businessId}`);
    let sent = false;
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && !sent) {
        sent = true;
        Promise.resolve(sendPayload(channel)).finally(() => {
          setTimeout(() => {
            if (!tableCallSubscriptions.has(businessId)) {
              sb.removeChannel(channel);
            }
          }, 1500);
        });
      }
    });
  } catch (err) {
    console.debug('Realtime table call emit failed:', err);
  }
}

export function subscribeToTableCalls(businessId, onEvent) {
  if (!businessId || typeof onEvent !== 'function') {
    return { unsubscribe: () => {} };
  }

  const sb = getSupabase();
  let entry = tableCallSubscriptions.get(businessId);

  if (!entry) {
    const listeners = new Set();
    const channel = sb
      .channel(`negu-table-calls-${businessId}`)
      .on('broadcast', { event: '*' }, (msg) => {
        if (msg?.payload) {
          listeners.forEach((cb) => {
            try {
              cb(msg.payload);
            } catch (err) {
              console.debug('Error en listener de llamado de mesa:', err);
            }
          });
        }
      })
      .subscribe();
    entry = { channel, listeners };
    tableCallSubscriptions.set(businessId, entry);
  }

  entry.listeners.add(onEvent);

  return {
    unsubscribe: () => {
      const current = tableCallSubscriptions.get(businessId);
      if (!current) return;
      current.listeners.delete(onEvent);
      if (current.listeners.size === 0) {
        tableCallSubscriptions.delete(businessId);
        sb.removeChannel(current.channel);
      }
    },
  };
}

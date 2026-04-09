const DEFAULT_IMAGE = 'images/taza.svg';
const CART_STORAGE_KEY = 'restaurante-carrito';
const CUSTOMER_STORAGE_KEY = 'restaurante-cliente';
const PRODUCT_NOTES_STORAGE_KEY = 'restaurante-notas-productos';
const ORDER_COMMENT_STORAGE_KEY = 'restaurante-comentario-pedido';
const WHATSAPP_PHONE = '573143243707';
const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
const SUPABASE_PRODUCT_BUCKET = 'product-images';
let supabaseClient = null;
let productSchemaCache = null;

const PRODUCT_SCHEMA_VARIANTS = [
  {
    label: 'es-no-unit',
    select: 'id, nombre, precio, descripcion, imagen',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion', image: 'imagen' }
  },
  {
    label: 'es-full',
    select: 'id, nombre, precio, descripcion, unidad, imagen',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion', unit: 'unidad', image: 'imagen' }
  },
  {
    label: 'es-basic',
    select: 'id, nombre, precio, descripcion',
    fields: { name: 'nombre', price: 'precio', description: 'descripcion' }
  },
  {
    label: 'en-full',
    select: 'id, name, price, description, unit, image',
    fields: { name: 'name', price: 'price', description: 'description', unit: 'unit', image: 'image' }
  },
  {
    label: 'en-no-unit',
    select: 'id, name, price, description, image',
    fields: { name: 'name', price: 'price', description: 'description', image: 'image' }
  },
  {
    label: 'en-basic',
    select: 'id, name, price, description',
    fields: { name: 'name', price: 'price', description: 'description' }
  }
];

productSchemaCache = PRODUCT_SCHEMA_VARIANTS[0];

function clampColor(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToHex(r, g, b) {
  const toHex = channel => clampColor(channel).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustRgb([r, g, b], amount) {
  return [clampColor(r + amount), clampColor(g + amount), clampColor(b + amount)];
}

function mixRgb(source, target, ratio = 0.5) {
  const [sr, sg, sb] = source;
  const [tr, tg, tb] = target;
  return [
    clampColor(sr * (1 - ratio) + tr * ratio),
    clampColor(sg * (1 - ratio) + tg * ratio),
    clampColor(sb * (1 - ratio) + tb * ratio)
  ];
}

function applyBrandPaletteFromLogo() {
  const logo = document.querySelector('.brand-mark img');
  if (!logo) {
    return;
  }

  const setPalette = () => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        return;
      }

      const size = 28;
      canvas.width = size;
      canvas.height = size;
      context.drawImage(logo, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;

      let r = 0;
      let g = 0;
      let b = 0;
      let samples = 0;
      let redR = 0;
      let redG = 0;
      let redB = 0;
      let redSamples = 0;
      let yellowR = 0;
      let yellowG = 0;
      let yellowB = 0;
      let yellowSamples = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha < 80) {
          continue;
        }
        const pr = pixels[i];
        const pg = pixels[i + 1];
        const pb = pixels[i + 2];

        r += pr;
        g += pg;
        b += pb;
        samples += 1;

        const isRed = pr > 150 && pg < 125 && pb < 125;
        const isYellow = pr > 160 && pg > 140 && pb < 130;
        if (isRed) {
          redR += pr;
          redG += pg;
          redB += pb;
          redSamples += 1;
        }
        if (isYellow) {
          yellowR += pr;
          yellowG += pg;
          yellowB += pb;
          yellowSamples += 1;
        }
      }

      if (!samples) {
        return;
      }

      const base = [r / samples, g / samples, b / samples];
      const primary = redSamples
        ? [redR / redSamples, redG / redSamples, redB / redSamples]
        : base;
      const secondary = yellowSamples
        ? [yellowR / yellowSamples, yellowG / yellowSamples, yellowB / yellowSamples]
        : adjustRgb(base, 32);
      const dark = adjustRgb(primary, -24);
      const soft = adjustRgb(primary, 150);
      const secondaryDark = adjustRgb(secondary, -12);
      const background = mixRgb(secondary, [255, 255, 255], 0.78);
      const softSurface = mixRgb(secondary, [255, 255, 255], 0.86);
      const border = mixRgb(secondary, [255, 255, 255], 0.48);
      const muted = mixRgb(primary, [40, 12, 16], 0.55);

      document.documentElement.style.setProperty('--primary', rgbToHex(...primary));
      document.documentElement.style.setProperty('--primary-dark', rgbToHex(...dark));
      document.documentElement.style.setProperty('--primary-soft', rgbToHex(...soft));
      document.documentElement.style.setProperty('--secondary', rgbToHex(...secondary));
      document.documentElement.style.setProperty('--secondary-dark', rgbToHex(...secondaryDark));
      document.documentElement.style.setProperty('--accent', rgbToHex(...secondary));
      document.documentElement.style.setProperty('--bg', rgbToHex(...background));
      document.documentElement.style.setProperty('--surface-soft', rgbToHex(...softSurface));
      document.documentElement.style.setProperty('--border', rgbToHex(...border));
      document.documentElement.style.setProperty('--muted', rgbToHex(...muted));
      document.documentElement.style.setProperty('--ring', `rgba(${clampColor(primary[0])}, ${clampColor(primary[1])}, ${clampColor(primary[2])}, 0.22)`);
    } catch (error) {
      console.warn('No fue posible aplicar paleta desde logo:', error);
    }
  };

  if (logo.complete) {
    setPalette();
  } else {
    logo.addEventListener('load', setPalette, { once: true });
  }
}

const PLACEHOLDER_IMAGES = [
  'images/taza.svg',
  'images/camiseta.svg',
  'images/stickers.svg',
  'images/hat.svg',
  'images/uploads/foto.png'
];

const DOGCITY_MENU_PRODUCTS = [
  {
    name: 'Perro Sencillo',
    price: 6000,
    description: 'Salchicha Delichi, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/uploads/foto.png'
  },
  {
    name: 'Perro Doble',
    price: 7000,
    description: 'Dos salchichas Delichi, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/hat.svg'
  },
  {
    name: 'Perro Americano',
    price: 10000,
    description: 'Pan brioche a base de papa, salchicha Zenú, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/camiseta.svg'
  },
  {
    name: 'Perro Polaco',
    price: 10000,
    description: 'Pan brioche a base de papa, salchicha ranchera, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/stickers.svg'
  },
  {
    name: 'Perro Mexicano',
    price: 10000,
    description: 'Pan brioche a base de papa, salchicha picante, chipotle, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/taza.svg'
  },
  {
    name: 'Perro Alemán',
    price: 10000,
    description: 'Pan brioche a base de papa, salchicha de cerdo ahumada, papa ripio crocante, cebolla, queso y salsas de la casa',
    unit: 'unidad',
    image: 'images/uploads/DOGCITY.png'
  }
];

function $(id) {
  return document.getElementById(id);
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function getPage() {
  return document.body.dataset.page || 'store';
}

function pickPlaceholderImage(seed = 0) {
  const index = Math.abs(Number(seed) || 0) % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[index];
}

function resolveProductImage(product, seed = 0) {
  const image = String(product?.image || '').trim();
  if (image && image !== DEFAULT_IMAGE) {
    return image;
  }
  return pickPlaceholderImage(seed || product?.id || product?.name?.length || 0);
}

function sanitizeFileName(value) {
  return String(value || 'producto')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'producto';
}

function getFileExtension(file) {
  const fromName = String(file?.name || '').split('.').pop()?.toLowerCase();
  if (fromName && fromName !== String(file?.name || '').toLowerCase()) {
    return fromName;
  }

  const mimeType = String(file?.type || '').toLowerCase();
  if (mimeType.includes('png')) {
    return 'png';
  }
  if (mimeType.includes('webp')) {
    return 'webp';
  }
  return 'jpg';
}

async function uploadProductImage(file, productName) {
  if (!file) {
    throw new Error('No se selecciono ninguna imagen.');
  }

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

  if (uploadError) {
    throw new Error(`No se pudo subir la imagen a Supabase Storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(SUPABASE_PRODUCT_BUCKET)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error('La imagen se subio, pero no se pudo obtener la URL publica.');
  }

  return data.publicUrl;
}
function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }
  if (!window.supabase?.createClient) {
    throw new Error('No se cargo supabase-js. Verifica el script CDN.');
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_PROJECT')) {
    throw new Error('Configura SUPABASE_URL y SUPABASE_ANON_KEY en index.html y admin.html.');
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

async function detectProductSchema() {
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

async function getProductSchema(forceRefresh = false) {
  if (!forceRefresh && productSchemaCache) {
    return productSchemaCache;
  }

  return detectProductSchema();
}

function buildProductRecord(product, schema) {
  const record = {};

  if (schema.fields.name) {
    record[schema.fields.name] = product.name;
  }
  if (schema.fields.price) {
    record[schema.fields.price] = Number(product.price);
  }
  if (schema.fields.description) {
    record[schema.fields.description] = product.description;
  }
  if (schema.fields.unit) {
    record[schema.fields.unit] = product.unit || 'unidad';
  }
  if (schema.fields.image) {
    record[schema.fields.image] = product.image || DEFAULT_IMAGE;
  }

  return record;
}

async function getSupabaseSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`No se pudo validar la sesión: ${error.message}`);
  }
  return data.session;
}

async function signInAdmin(email, password) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`No se pudo iniciar sesión: ${error.message}`);
  }
  return data.session;
}

async function signOutAdmin() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`No se pudo cerrar sesión: ${error.message}`);
  }
}

function subscribeToProductsRealtime(onChange) {
  const supabase = getSupabaseClient();
  return supabase
    .channel(`productos-realtime-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'productos' },
      payload => {
        onChange(payload);
      }
    )
    .subscribe();
}

function initNavToggle() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!navToggle || !navLinks) {
    return;
  }

  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 780) {
      closeMenu();
    }
  });
}

function normalizeProductRow(row) {
  return {
    id: Number(row.id),
    name: row.nombre || row.name || 'Producto',
    price: Number(row.precio ?? row.price ?? 0),
    description: row.descripcion || row.description || '',
    unit: row.unidad || row.unit || 'unidad',
    image: row.imagen || row.image || DEFAULT_IMAGE
  };
}

async function loadProducts() {
  const supabase = getSupabaseClient();
  const schema = await getProductSchema();
  const { data, error } = await supabase
    .from('productos')
    .select(schema.select)
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar productos: ${error.message}`);
  }

  const products = (data || []).map(normalizeProductRow);
  if (products.length === 0) {
    return DOGCITY_MENU_PRODUCTS.map((product, index) => ({
      id: -(index + 1),
      ...product
    }));
  }
  return products;
}

async function seedDefaultCatalogIfEmpty() {
  const supabase = getSupabaseClient();
  const schema = await getProductSchema();
  const { count, error: countError } = await supabase
    .from('productos')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`No se pudo revisar el catálogo: ${countError.message}`);
  }

  if ((count || 0) > 0) {
    return false;
  }

  const { error } = await supabase
    .from('productos')
    .insert(DOGCITY_MENU_PRODUCTS.map(product => buildProductRecord(product, schema)));

  if (error) {
    throw new Error(`No se pudo sembrar el menú inicial: ${error.message}`);
  }

  return true;
}

async function createProduct(product) {
  const supabase = getSupabaseClient();
  const schema = await getProductSchema();
  const { data, error } = await supabase
    .from('productos')
    .insert([buildProductRecord(product, schema)])
    .select(schema.select)
    .single();

  if (error) {
    throw new Error(`No se pudo crear producto: ${error.message}`);
  }
  return normalizeProductRow(data);
}

async function deleteProduct(productId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('productos')
    .delete()
    .eq('id', Number(productId))
    .select('id');

  if (error) {
    throw new Error(`No se pudo eliminar producto: ${error.message}`);
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No se pudo eliminar producto: Supabase no confirmo la eliminacion. Revisa permisos de DELETE/RLS.');
  }
}

async function updateProduct(productId, productData) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('productos')
    .update(buildProductRecord(productData, await getProductSchema()))
    .eq('id', Number(productId))
    .select('id');

  if (error) {
    throw new Error(`No se pudo actualizar producto: ${error.message}`);
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No se pudo actualizar producto: Supabase no confirmo cambios. Revisa permisos de UPDATE/RLS.');
  }

  return true;
}

function buildStoreApp() {
  const state = {
    products: [],
    quantities: {},
    notes: {},
    search: '',
    sort: 'featured',
    locationLink: '',
    locationLabel: '',
    lastChangedProductId: null
  };

  const productsList = $('productsList');
  const productsEmptyState = $('productsEmptyState');
  const orderSummary = $('orderSummary');
  const orderTotal = $('orderTotal');
  const selectedCount = $('selectedCount');
  const generatedMessage = $('generatedMessage');
  const whatsappLink = $('whatsappLink');
  const generateBtn = $('generateBtn');
  const mobileGenerateBtn = $('mobileGenerateBtn');
  const openOrderModalBtn = $('openOrderModalBtn');
  const closeOrderModalBtn = $('closeOrderModalBtn');
  const orderModal = $('orderModal');
  const orderModalBackdrop = $('orderModalBackdrop');
  const copyBtn = $('copyBtn');
  const searchInput = $('searchInput');
  const sortSelect = $('sortSelect');
  const customerName = $('customerName');
  const customerAddress = $('customerAddress');
  const customerPhone = $('customerPhone');
  const locationBtn = $('locationBtn');
  const locationStatus = $('locationStatus');
  const orderComment = $('orderComment');
  const mobileOrderTotal = $('mobileOrderTotal');
  const mobileSelectedCount = $('mobileSelectedCount');
  const floatingOrderTotal = $('floatingOrderTotal');
  const floatingSelectedCount = $('floatingSelectedCount');

  function setOrderModalOpen(isOpen) {
    if (!orderModal) {
      return;
    }

    orderModal.classList.toggle('hidden', !isOpen);
    orderModal.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('modal-open', isOpen);
    orderModal.setAttribute('aria-hidden', String(!isOpen));
  }

  function openOrderModal() {
    setOrderModalOpen(true);
  }

  function closeOrderModal() {
    setOrderModalOpen(false);
  }

  function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.quantities));
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function saveCustomerInfo() {
    const payload = {
      name: customerName.value.trim(),
      address: customerAddress.value.trim(),
      phone: customerPhone.value.trim(),
      locationLink: state.locationLink,
      locationLabel: state.locationLabel
    };
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(payload));
  }

  function saveOrderComment() {
    if (!orderComment) {
      return;
    }
    localStorage.setItem(ORDER_COMMENT_STORAGE_KEY, orderComment.value.trim());
  }

  function loadOrderComment() {
    if (!orderComment) {
      return;
    }
    orderComment.value = localStorage.getItem(ORDER_COMMENT_STORAGE_KEY) || '';
  }

  function loadCustomerInfo() {
    try {
      const info = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY) || '{}');
      customerName.value = info.name || '';
      customerAddress.value = info.address || '';
      customerPhone.value = info.phone || '';
      state.locationLink = info.locationLink || '';
      state.locationLabel = info.locationLabel || '';
      locationStatus.textContent = state.locationLabel || 'Debes agregar tu ubicación actual para poder enviar el pedido.';
    } catch (error) {
      customerName.value = '';
      customerAddress.value = '';
      customerPhone.value = '';
      state.locationLink = '';
      state.locationLabel = '';
      locationStatus.textContent = 'Debes agregar tu ubicación actual para poder enviar el pedido.';
    }
  }

  function saveProductNotes() {
    localStorage.setItem(PRODUCT_NOTES_STORAGE_KEY, JSON.stringify(state.notes));
  }

  function loadProductNotes() {
    try {
      return JSON.parse(localStorage.getItem(PRODUCT_NOTES_STORAGE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function getVisibleProducts() {
    const search = state.search.trim().toLowerCase();
    let filtered = state.products.filter(product => {
      const text = `${product.name} ${product.description}`.toLowerCase();
      return text.includes(search);
    });

    if (state.sort === 'name-asc') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    } else if (state.sort === 'price-asc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (state.sort === 'price-desc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }

  function getSelectedItems() {
    return state.products
      .map(product => ({
        ...product,
        quantity: Number(state.quantities[product.id] || 0)
      }))
      .filter(item => item.quantity > 0);
  }

  function resetGeneratedMessage() {
    generatedMessage.value = '';
    whatsappLink.href = '#';
    whatsappLink.classList.add('disabled');
    whatsappLink.textContent = 'Enviar a WhatsApp';
  }

  function applyProducts(nextProducts) {
    const nextQuantities = {};
    const nextNotes = {};

    nextProducts.forEach(product => {
      nextQuantities[product.id] = Number(state.quantities[product.id] || 0);
      nextNotes[product.id] = typeof state.notes[product.id] === 'string' ? state.notes[product.id] : '';
    });

    state.products = nextProducts;
    state.quantities = nextQuantities;
    state.notes = nextNotes;
    saveCart();
    saveProductNotes();
  }

  async function refreshProducts() {
    const nextProducts = await loadProducts();
    applyProducts(nextProducts);
    renderProducts();
    updateOrderDisplay();
  }

  function renderProducts() {
    const visibleProducts = getVisibleProducts();
    productsEmptyState.classList.toggle('hidden', visibleProducts.length > 0);

    productsList.innerHTML = visibleProducts.map(product => {
      const quantity = Number(state.quantities[product.id] || 0);
      const subtotal = quantity * product.price;
      const note = state.notes[product.id] || '';

      return `
        <article class="product-card ${quantity > 0 ? 'is-active' : ''} ${String(state.lastChangedProductId) === String(product.id) ? 'is-highlight' : ''}">
          <img src="${escapeHtml(resolveProductImage(product, product.id))}" alt="${escapeHtml(product.name)}" loading="lazy" />
          <div class="product-card-body">
            <div class="product-card-head">
              <div>
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description || 'Sin descripción disponible.')}</p>
              </div>
              <strong>${formatMoney(product.price)}</strong>
            </div>

            <div class="product-card-footer">
              <span class="product-unit">Venta por ${escapeHtml(product.unit || 'unidad')}</span>
              <span class="product-subtotal">${quantity > 0 ? `Subtotal: ${formatMoney(subtotal)}` : 'Sin seleccionar'}</span>
            </div>

            <div class="quantity-group" data-product-id="${product.id}">
              <button type="button" class="qty-btn" data-action="decrease">-</button>
              <input type="number" min="0" step="1" value="${quantity}" data-product-id="${product.id}" />
              <button type="button" class="qty-btn" data-action="increase">+</button>
            </div>

            <label class="product-note-field ${quantity > 0 ? '' : 'is-disabled'}">
              <span>Detalle del pedido</span>
              <input
                type="text"
                value="${escapeHtml(note)}"
                data-note-product-id="${product.id}"
                placeholder="Ej. sin cebolla, con extra salsa"
                ${quantity > 0 ? '' : 'disabled'}
              />
            </label>
          </div>
        </article>
      `;
    }).join('');
  }

  function updateOrderDisplay() {
    const selectedItems = getSelectedItems();
    const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const units = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

    orderTotal.textContent = formatMoney(total);
    selectedCount.textContent = `${units} ${units === 1 ? 'producto seleccionado' : 'productos seleccionados'}`;
    if (mobileOrderTotal) {
      mobileOrderTotal.textContent = formatMoney(total);
    }
    if (mobileSelectedCount) {
      mobileSelectedCount.textContent = `${units} ${units === 1 ? 'producto' : 'productos'}`;
    }
    if (floatingOrderTotal) {
      floatingOrderTotal.textContent = formatMoney(total);
    }
    if (floatingSelectedCount) {
      floatingSelectedCount.textContent = `${units} ${units === 1 ? 'producto' : 'productos'}`;
    }

    if (selectedItems.length === 0) {
      orderSummary.textContent = 'No hay productos seleccionados.';
      resetGeneratedMessage();
      return;
    }

    orderSummary.innerHTML = selectedItems
      .map(item => `<span>${item.quantity} x ${escapeHtml(item.name)} = <strong>${formatMoney(item.quantity * item.price)}</strong></span>`)
      .join('<br>');
  }

  function generateToken() {
    // Generar token aleatorio de 16 caracteres
    return Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(36).padStart(2, '0'))
      .join('')
      .substring(0, 16);
  }

  async function saveOrderToSupabase(items) {
    const supabase = getSupabaseClient();
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const name = customerName.value.trim() || 'Por confirmar';
    const address = customerAddress.value.trim() || 'Por confirmar';

    // Crear texto de productos para la columna productos
    const textoProductos = items.map(item => {
      const note = state.notes[item.id] ? ` (${state.notes[item.id]})` : '';
      return `• ${item.quantity} x ${item.name}${note}`;
    }).join('\n');

    // Generar token único
    const token = generateToken();

    // Adaptado a las columnas existentes en tu tabla
    const orderData = {
      nombre: name,
      direccion: address,
      productos: textoProductos,
      total: total,
      token: token,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('pedidos')
      .insert([orderData])
      .select('id')
      .single();

    if (error) {
      console.error('Error Supabase:', error);
      throw new Error(`No se pudo guardar el pedido: ${error.message}`);
    }

    return { id: data.id, token: token };
  }

  function buildWhatsAppMessage(items, orderNumber, token) {
    const displayNumber = orderNumber || 'PENDIENTE';
    const lineItems = items.map(item => {
      const note = (state.notes[item.id] || '').trim();
      return note
        ? `• ${item.quantity} x ${item.name}\n  - Nota: ${note}`
        : `• ${item.quantity} x ${item.name}`;
    }).join('\n');
    const total = formatMoney(items.reduce((sum, item) => sum + item.quantity * item.price, 0));
    const name = customerName.value.trim() || 'Por confirmar';
    const address = customerAddress.value.trim() || 'Por confirmar';
    const phone = customerPhone.value.trim() || 'Por confirmar';
    const comment = orderComment?.value.trim() || 'Sin comentarios adicionales.';

    if (!state.locationLink) {
      return '⚠️ Se requiere ubicación para enviar el pedido.';
    }

    // Generar link de seguimiento si tenemos token
    let trackingInfo = '';
    if (token && orderNumber) {
      const trackingUrl = `${window.location.origin}/pedido.html?id=${orderNumber}&token=${token}`;
      trackingInfo = `\n\n🔗 Seguimiento: ${trackingUrl}`;
    }

    return [
      'Hola Dog City 👋, quiero hacer un pedido.',
      '',
      `🧾 Pedido #${displayNumber}`,
      `🙋 Nombre: ${name}`,
      `📍 Dirección: ${address}`,
      `📞 Teléfono: ${phone}`,
      `💬 Comentarios: ${comment}`,
      `📍 Ubicación: ${state.locationLink}`,
      '',
      '📦 Productos:',
      lineItems,
      '',
      `💰 Total: ${total}`,
      trackingInfo,
      '',
      'Gracias 🙌'
    ].join('\n');
  }

  function refreshLocationRequiredState() {
    const locationBox = locationStatus.closest('.location-box');
    const hasLocation = Boolean(state.locationLink);
    locationBox?.classList.toggle('is-required', !hasLocation);
  }

  function updateLocation() {
    if (!navigator.geolocation) {
      locationStatus.textContent = 'Tu navegador no soporta geolocalizacion.';
      return;
    }

    const isSecureContextAvailable = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isSecureContextAvailable) {
      locationStatus.textContent = 'La ubicacion en iPhone necesita abrir la web en HTTPS. Si estas en HTTP, Safari no la permitira.';
      return;
    }

    locationBtn.disabled = true;
    locationBtn.textContent = 'Ubicando...';
    locationStatus.textContent = 'Solicitando tu ubicacion actual...';

    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      state.locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      state.locationLabel = 'Ubicacion actual agregada correctamente.';
      locationStatus.textContent = state.locationLabel;
      locationBtn.disabled = false;
      locationBtn.textContent = 'Actualizar ubicacion';
      saveCustomerInfo();
      refreshLocationRequiredState();
    }, error => {
      if (error?.code === 1) {
        locationStatus.textContent = 'Safari no tiene permiso de ubicacion. En iPhone revisa Ajustes > Safari > Ubicacion o permite el acceso al sitio.';
      } else if (error?.code === 2) {
        locationStatus.textContent = 'No se pudo detectar tu ubicacion actual. Revisa señal, GPS o intenta de nuevo al aire libre.';
      } else if (error?.code === 3) {
        locationStatus.textContent = 'La ubicacion tardo demasiado. Intenta nuevamente con mejor señal.';
      } else {
        locationStatus.textContent = 'No fue posible obtener tu ubicacion. En iPhone suele requerir HTTPS y permisos de Safari.';
      }
      state.locationLink = '';
      state.locationLabel = '';
      locationBtn.disabled = false;
      locationBtn.textContent = 'Usar mi ubicacion actual';
      saveCustomerInfo();
      refreshLocationRequiredState();
    }, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    });
  }

  function generateMessage() {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      resetGeneratedMessage();
      generatedMessage.value = 'Selecciona al menos un producto antes de generar el pedido.';
      whatsappLink.classList.add('disabled');
      return;
    }

    if (!state.locationLink) {
      resetGeneratedMessage();
      generatedMessage.value = 'La ubicación es obligatoria. Presiona "Usar mi ubicación actual" para continuar.';
      locationStatus.textContent = 'La ubicación es obligatoria para enviar el pedido.';
      refreshLocationRequiredState();
      whatsappLink.classList.add('disabled');
      return;
    }

    saveCustomerInfo();
    saveOrderComment();
    refreshLocationRequiredState();
    // Solo generar mensaje preview, SIN guardar en Supabase todavía
    const message = buildWhatsAppMessage(selectedItems, null);
    generatedMessage.value = message;
    // Activar botón WhatsApp (visualmente) pero aún no guarda en BD
    whatsappLink.classList.remove('disabled');
    whatsappLink.textContent = 'Enviar a WhatsApp';
  }

  async function copyMessage() {
    if (!generatedMessage.value.trim()) {
      generateMessage();
    }

    if (!generatedMessage.value.trim()) {
      return;
    }

    await navigator.clipboard.writeText(generatedMessage.value);
    copyBtn.textContent = 'Mensaje copiado';
    window.setTimeout(() => {
      copyBtn.textContent = 'Copiar mensaje';
    }, 1800);
  }

  function syncQuantity(productId, value) {
    const nextValue = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    state.quantities[productId] = nextValue;
    state.lastChangedProductId = productId;

    productsList.querySelectorAll(`input[data-product-id="${productId}"]`).forEach(input => {
      input.value = nextValue;
    });

    updateOrderDisplay();
    resetGeneratedMessage();
    saveCart();
    window.setTimeout(() => {
      state.lastChangedProductId = null;
      renderProducts();
    }, 360);
  }

  function handleProductControls(event) {
    const button = event.target.closest('.qty-btn');
    const input = event.target.closest('input[data-product-id]');
    const noteInput = event.target.closest('input[data-note-product-id]');

    if (button) {
      const wrapper = button.closest('[data-product-id]');
      const productId = wrapper?.dataset.productId;
      if (!productId) {
        return;
      }

      const currentValue = Number(state.quantities[productId] || 0);
      const nextValue = button.dataset.action === 'increase'
        ? currentValue + 1
        : Math.max(0, currentValue - 1);

      syncQuantity(productId, nextValue);
      renderProducts();
      return;
    }

    if (input) {
      syncQuantity(input.dataset.productId, Number(input.value));
      renderProducts();
    }

    if (noteInput) {
      state.notes[noteInput.dataset.noteProductId] = noteInput.value;
      saveProductNotes();
      updateOrderDisplay();
      resetGeneratedMessage();
    }
  }

  async function init() {
    state.products = await loadProducts();
    const savedCart = loadCart();
    state.notes = loadProductNotes();
    state.quantities = state.products.reduce((accumulator, product) => {
      accumulator[product.id] = Number(savedCart[product.id] || 0);
      if (typeof state.notes[product.id] !== 'string') {
        state.notes[product.id] = '';
      }
      return accumulator;
    }, {});

    loadCustomerInfo();
    loadOrderComment();
    refreshLocationRequiredState();
    renderProducts();
    updateOrderDisplay();

    searchInput.addEventListener('input', event => {
      state.search = event.target.value;
      renderProducts();
    });

    sortSelect.addEventListener('change', event => {
      state.sort = event.target.value;
      renderProducts();
    });

    [customerName, customerAddress, customerPhone].forEach(input => {
      input.addEventListener('input', saveCustomerInfo);
    });
    orderComment?.addEventListener('input', () => {
      saveOrderComment();
      resetGeneratedMessage();
    });

    productsList.addEventListener('click', handleProductControls);
    productsList.addEventListener('input', handleProductControls);
    // Botón "Generar pedido" dentro del modal - genera mensaje y activa WhatsApp
    generateBtn.addEventListener('click', () => {
      generateMessage();
    });
    // Botones flotantes solo abren el modal limpio (sin generar mensaje)
    mobileGenerateBtn?.addEventListener('click', () => {
      resetGeneratedMessage();
      openOrderModal();
    });
    openOrderModalBtn?.addEventListener('click', () => {
      resetGeneratedMessage();
      openOrderModal();
    });
    closeOrderModalBtn?.addEventListener('click', closeOrderModal);
    orderModalBackdrop?.addEventListener('click', closeOrderModal);
    locationBtn.addEventListener('click', updateLocation);
    copyBtn.addEventListener('click', () => {
      copyMessage().catch(error => {
        console.warn('No se pudo copiar el mensaje:', error);
      });
    });

    async function handleWhatsAppSend(event) {
      event.preventDefault();
      const selectedItems = getSelectedItems();

      if (selectedItems.length === 0) {
        generatedMessage.value = 'Selecciona al menos un producto antes de enviar.';
        return;
      }

      if (!state.locationLink) {
        generatedMessage.value = 'La ubicación es obligatoria. Presiona "Usar mi ubicación actual" para continuar.';
        locationStatus.textContent = 'La ubicación es obligatoria para enviar el pedido.';
        refreshLocationRequiredState();
        return;
      }

      // Deshabilitar botón durante el proceso
      whatsappLink.classList.add('disabled');
      whatsappLink.textContent = 'Guardando pedido...';

      try {
        // 1. Guardar pedido en Supabase (solo aquí se genera el ID real + token)
        const { id: orderId, token } = await saveOrderToSupabase(selectedItems);

        // 2. Generar mensaje con el número de orden real y token
        const message = buildWhatsAppMessage(selectedItems, orderId, token);
        generatedMessage.value = message;

        // 3. Abrir WhatsApp con el mensaje
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // 4. Limpiar carrito después de enviar
        state.quantities = {};
        state.notes = {};
        saveCart();
        saveProductNotes();
        renderProducts();
        updateOrderDisplay();

        // 5. Cerrar modal y mostrar éxito
        whatsappLink.textContent = '¡Pedido enviado!';
        setTimeout(() => {
          closeOrderModal();
          whatsappLink.textContent = 'Enviar a WhatsApp';
        }, 1500);

      } catch (error) {
        console.error('Error al guardar pedido:', error);
        generatedMessage.value = `Error al guardar el pedido: ${error.message}`;
        whatsappLink.textContent = 'Error - intenta de nuevo';
        setTimeout(() => {
          whatsappLink.classList.remove('disabled');
          whatsappLink.textContent = 'Enviar a WhatsApp';
        }, 2000);
      }
    }

    whatsappLink.addEventListener('click', (event) => {
      if (whatsappLink.classList.contains('disabled')) {
        event.preventDefault();
        return;
      }
      handleWhatsAppSend(event).catch(error => {
        console.error('Error en envío WhatsApp:', error);
      });
    });

    subscribeToProductsRealtime(() => {
      refreshProducts().catch(error => {
        console.warn('No se pudo refrescar la tienda en tiempo real:', error);
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && orderModal && !orderModal.classList.contains('hidden')) {
        closeOrderModal();
      }
    });
  }

  return { init };
}

function buildAdminApp() {
  const state = {
    products: [],
    editingProductId: null
  };

  const newProductForm = $('newProductForm');
  const adminProductsList = $('adminProductsList');
  const adminEmptyState = $('adminEmptyState');
  const saveStatus = $('saveStatus');
  const editingProductId = $('editingProductId');
  const adminFormKicker = $('adminFormKicker');
  const adminFormTitle = $('adminFormTitle');
  const adminFormDescription = $('adminFormDescription');
  const saveProductBtn = $('saveProductBtn');
  const cancelEditBtn = $('cancelEditBtn');
  const imageFileInput = $('imageFileInput');
  const imagePreview = $('imagePreview');
  const adminAccessGate = $('adminAccessGate');
  const adminEmailInput = $('adminEmailInput');
  const adminPasswordInput = $('adminPasswordInput');
  const adminLoginBtn = $('adminLoginBtn');
  const adminPinStatus = $('adminPinStatus');
  const adminLogoutBtn = $('adminLogoutBtn');

  function setSaveStatus(message, tone = 'neutral') {
    saveStatus.textContent = message;
    saveStatus.dataset.tone = tone;
  }

  function setAdminAuthenticated(session) {
    const isAuthenticated = Boolean(session);
    adminAccessGate?.classList.toggle('hidden', isAuthenticated);
    adminLogoutBtn?.classList.toggle('hidden', !isAuthenticated);
    newProductForm?.classList.toggle('is-locked', !isAuthenticated);

    if (isAuthenticated) {
      adminPinStatus.textContent = `Sesión activa como ${session.user.email}.`;
      adminPinStatus.style.color = '#16a34a';
      setSaveStatus('Conectado con Supabase: catálogo online activo.', 'success');
      return;
    }

    adminPinStatus.textContent = 'Solo usuarios autenticados pueden crear, editar o eliminar productos.';
    adminPinStatus.style.color = '';
    state.products = [];
    renderProducts();
  }

  function validateProduct(product) {
    if (!product.name) {
      return 'El nombre es obligatorio.';
    }
    if (!product.description) {
      return 'La descripción es obligatoria.';
    }
    if (!Number.isFinite(product.price) || product.price <= 0) {
      return 'El precio debe ser mayor que cero.';
    }
    return '';
  }

  function buildProductFromForm(formData) {
    const currentProduct = state.products.find(item => Number(item.id) === Number(state.editingProductId));
    return {
      name: formData.get('name').trim(),
      price: Number(formData.get('price')),
      description: formData.get('description').trim(),
      image: currentProduct?.image || pickPlaceholderImage(formData.get('name')?.length || 0),
      unit: formData.get('unit').trim() || 'unidad'
    };
  }

  function updateImagePreview(source) {
    imagePreview.src = source || pickPlaceholderImage(1);
  }

  async function buildProductPayload() {
    const formData = new FormData(newProductForm);
    const file = imageFileInput.files?.[0];
    const baseProduct = buildProductFromForm(formData);

    if (!file) {
      return baseProduct;
    }

    const uploadedImageUrl = await uploadProductImage(file, baseProduct.name);
    return {
      ...baseProduct,
      image: uploadedImageUrl || baseProduct.image
    };
  }

  function resetForm() {
    state.editingProductId = null;
    editingProductId.value = '';
    newProductForm.reset();
    newProductForm.elements.unit.value = 'unidad';
    imageFileInput.value = '';
    updateImagePreview(pickPlaceholderImage(2));
    adminFormKicker.textContent = 'Nuevo producto';
    adminFormTitle.textContent = 'Crear producto';
    adminFormDescription.textContent = 'Los cambios se guardan en Supabase y se reflejan de inmediato en la tienda.';
    saveProductBtn.textContent = 'Guardar producto';
    cancelEditBtn.classList.add('hidden');
  }

  function startEditProduct(productId) {
    const product = state.products.find(item => Number(item.id) === Number(productId));
    if (!product) {
      return;
    }

    state.editingProductId = Number(productId);
    editingProductId.value = String(product.id);
    newProductForm.elements.name.value = product.name || '';
    newProductForm.elements.price.value = product.price || '';
    newProductForm.elements.description.value = product.description || '';
    newProductForm.elements.unit.value = product.unit || 'unidad';
    imageFileInput.value = '';
    updateImagePreview(resolveProductImage(product, product.id));
    adminFormKicker.textContent = 'Editar producto';
    adminFormTitle.textContent = `Editando: ${product.name}`;
    adminFormDescription.textContent = 'Actualiza la información y guarda los cambios del producto.';
    saveProductBtn.textContent = 'Guardar cambios';
    cancelEditBtn.classList.remove('hidden');
    setSaveStatus(`Editando "${product.name}".`, 'warning');
  }

  function renderProducts() {
    adminEmptyState.classList.toggle('hidden', state.products.length > 0);
    adminProductsList.innerHTML = state.products.map(product => `
      <article class="admin-product-card">
        <img src="${escapeHtml(resolveProductImage(product, product.id))}" alt="${escapeHtml(product.name)}" loading="lazy" />
        <div class="admin-product-body">
          <div>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description || 'Sin descripción disponible.')}</p>
          </div>
          <div class="admin-product-meta">
            <span>${formatMoney(product.price)}</span>
            <span>${escapeHtml(product.unit || 'unidad')}</span>
          </div>
        </div>
        <div class="admin-product-actions">
          <button class="btn btn-secondary edit-product-btn" type="button" data-product-id="${product.id}">Editar</button>
          <button class="btn btn-danger delete-product-btn" type="button" data-product-id="${product.id}">Eliminar</button>
        </div>
      </article>
    `).join('');
  }

  async function refreshProducts() {
    state.products = await loadProducts();
    renderProducts();
  }

  // Funciones para gestionar pedidos
  async function loadOrders() {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      return [];
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('No hay conexión con Supabase');
    const { error } = await supabase
      .from('pedidos')
      .update({ status: newStatus })
      .eq('id', orderId);
    if (error) throw error;
  }

  async function deleteOrder(orderId) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('No hay conexión con Supabase');
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', orderId);
    if (error) throw error;
  }

  function getStatusClass(status) {
    const statusMap = {
      'nuevo': 'status-nuevo',
      'preparando': 'status-preparando',
      'listo': 'status-listo',
      'entregado': 'status-entregado',
      'cancelado': 'status-cancelado'
    };
    return statusMap[status] || 'status-nuevo';
  }

  function getStatusText(status) {
    const statusMap = {
      'nuevo': '🆕 Nuevo',
      'preparando': '👨‍🍳 Preparando',
      'listo': '✅ Listo',
      'entregado': '🚚 Entregado',
      'cancelado': '❌ Cancelado'
    };
    return statusMap[status] || status;
  }

  function renderOrders(orders) {
    const adminOrdersList = $('adminOrdersList');
    const adminOrdersEmptyState = $('adminOrdersEmptyState');
    if (!adminOrdersList || !adminOrdersEmptyState) return;

    adminOrdersEmptyState.classList.toggle('hidden', orders.length > 0);

    adminOrdersList.innerHTML = orders.map(order => `
      <article class="admin-order-card">
        <div class="admin-order-header">
          <span class="admin-order-number">Pedido #${order.id}</span>
          <span class="admin-order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
        </div>
        <div class="admin-order-info">
          <div><strong>Cliente:</strong> ${escapeHtml(order.nombre || 'Por confirmar')}</div>
          <div><strong>Dirección:</strong> ${escapeHtml(order.direccion || 'Por confirmar')}</div>
          <div><strong>Total:</strong> ${formatMoney(order.total)}</div>
          <div><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString('es-CO')}</div>
        </div>
        <div class="admin-order-products">${escapeHtml(order.productos || 'Sin productos')}</div>
        <div class="admin-order-actions">
          <select class="order-status-select" data-order-id="${order.id}">
            <option value="nuevo" ${order.status === 'nuevo' ? 'selected' : ''}>🆕 Nuevo</option>
            <option value="preparando" ${order.status === 'preparando' ? 'selected' : ''}>👨‍🍳 Preparando</option>
            <option value="listo" ${order.status === 'listo' ? 'selected' : ''}>✅ Listo</option>
            <option value="entregado" ${order.status === 'entregado' ? 'selected' : ''}>🚚 Entregado</option>
            <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>❌ Cancelado</option>
          </select>
          <button class="btn btn-primary update-status-btn" type="button" data-order-id="${order.id}">💾 Guardar</button>
          <a href="pedido.html?id=${order.id}&token=${order.token}" target="_blank" class="btn btn-secondary">👁️ Ver</a>
          <button class="btn btn-danger delete-order-btn" type="button" data-order-id="${order.id}">🗑️ Eliminar</button>
        </div>
      </article>
    `).join('');
  }

  async function refreshOrders() {
    const orders = await loadOrders();
    renderOrders(orders);
  }

  async function handleOrderStatusUpdate(event) {
    const button = event.target.closest('.update-status-btn');
    if (!button) return;

    const orderId = button.dataset.orderId;
    const card = button.closest('.admin-order-card');
    const select = card?.querySelector('.order-status-select');
    if (!select) return;

    const newStatus = select.value;
    const originalText = button.textContent;

    try {
      button.textContent = 'Guardando...';
      button.disabled = true;
      await updateOrderStatus(orderId, newStatus);
      button.textContent = '¡Guardado!';
      setSaveStatus(`Pedido #${orderId} → ${getStatusText(newStatus)}`, 'success');
      setTimeout(() => {
        refreshOrders();
      }, 800);
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      button.textContent = 'Error';
      setSaveStatus('Error al actualizar', 'error');
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1500);
    }
  }

  async function handleOrderDelete(event) {
    const button = event.target.closest('.delete-order-btn');
    if (!button) return;

    const orderId = button.dataset.orderId;
    const card = button.closest('.admin-order-card');
    
    // Mostrar confirmación
    if (!confirm(`¿Estás seguro de eliminar el Pedido #${orderId}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    const originalText = button.textContent;

    try {
      button.textContent = 'Eliminando...';
      button.disabled = true;
      await deleteOrder(orderId);
      setSaveStatus(`Pedido #${orderId} eliminado`, 'warning');
      
      // Animar salida
      card.style.opacity = '0.5';
      card.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        refreshOrders();
      }, 400);
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      button.textContent = 'Error';
      setSaveStatus('Error al eliminar pedido', 'error');
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1500);
    }
  }

  async function refreshAdminAuthState() {
    const session = await getSupabaseSession();
    setAdminAuthenticated(session);
    return session;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const product = await buildProductPayload();
    const validationError = validateProduct(product);

    if (validationError) {
      setSaveStatus(validationError, 'error');
      return;
    }

    if (state.editingProductId) {
      await updateProduct(state.editingProductId, product);
      setSaveStatus('Producto actualizado correctamente.', 'success');
    } else {
      await createProduct(product);
      setSaveStatus('Producto guardado correctamente.', 'success');
    }

    resetForm();
    await refreshProducts();
  }

  async function handleDelete(event) {
    const button = event.target.closest('.delete-product-btn');
    if (!button) {
      return;
    }

    await deleteProduct(button.dataset.productId);
    setSaveStatus('Producto eliminado correctamente.', 'warning');
    await refreshProducts();
  }

  function handleListActions(event) {
    const editButton = event.target.closest('.edit-product-btn');
    if (editButton) {
      startEditProduct(editButton.dataset.productId);
      return;
    }

    const deleteButton = event.target.closest('.delete-product-btn');
    if (deleteButton) {
      return handleDelete({ target: deleteButton });
    }
  }

  async function handleAdminLogin() {
    const email = (adminEmailInput?.value || '').trim();
    const password = (adminPasswordInput?.value || '').trim();

    if (!email || !password) {
      adminPinStatus.textContent = 'Ingresa correo y contraseña.';
      adminPinStatus.style.color = '#e10613';
      return;
    }

    adminLoginBtn.disabled = true;
    adminLoginBtn.textContent = 'Entrando...';

    try {
      const session = await signInAdmin(email, password);
      setAdminAuthenticated(session);
      adminPasswordInput.value = '';
      await refreshProducts();
    } catch (error) {
      adminPinStatus.textContent = error.message || 'No se pudo iniciar sesión.';
      adminPinStatus.style.color = '#e10613';
    } finally {
      adminLoginBtn.disabled = false;
      adminLoginBtn.textContent = 'Entrar al panel';
    }
  }

  async function init() {
    const supabase = getSupabaseClient();
    supabase.auth.onAuthStateChange((_event, session) => {
      setAdminAuthenticated(session);
      if (session) {
        seedDefaultCatalogIfEmpty()
          .catch(error => {
            console.warn('No se pudo sembrar el menú inicial:', error);
          })
          .finally(() => {
            refreshProducts().catch(error => {
              console.warn('No se pudieron refrescar productos tras autenticar:', error);
              setSaveStatus(error.message || 'No se pudieron cargar productos.', 'error');
            });
          });
      }
    });

    resetForm();
    const session = await refreshAdminAuthState();
    if (session) {
      try {
        const seeded = await seedDefaultCatalogIfEmpty();
        if (seeded) {
          setSaveStatus('Se cargó el menú inicial de DogCity en Supabase.', 'success');
        }
      } catch (error) {
        console.warn('No se pudo sembrar el menú inicial:', error);
      }
      await refreshProducts();
    } else {
      setSaveStatus('Inicia sesión para administrar el catálogo.', 'warning');
    }
    newProductForm.addEventListener('submit', event => {
      handleSubmit(event).catch(error => {
        console.warn('No se pudo guardar el producto:', error);
        const message = error.message || 'No se pudo guardar el producto.';
        if (message.includes('Storage')) {
          setSaveStatus(`${message} Verifica que exista el bucket "${SUPABASE_PRODUCT_BUCKET}" y que permita subir archivos.`, 'error');
          return;
        }
        setSaveStatus(message, 'error');
      });
    });

    adminProductsList.addEventListener('click', event => {
      Promise.resolve(handleListActions(event)).catch(error => {
        console.warn('No se pudo eliminar el producto:', error);
        setSaveStatus(error.message || 'No se pudo procesar la acción.', 'error');
      });
    });

    cancelEditBtn.addEventListener('click', () => {
      resetForm();
      setSaveStatus('Edición cancelada.', 'warning');
    });

    imageFileInput.addEventListener('change', () => {
      const file = imageFileInput.files?.[0];
      if (!file) {
        updateImagePreview(pickPlaceholderImage(3));
        return;
      }

      const localUrl = URL.createObjectURL(file);
      updateImagePreview(localUrl);
    });

    adminLoginBtn?.addEventListener('click', () => {
      handleAdminLogin().catch(error => {
        adminPinStatus.textContent = error.message || 'No se pudo iniciar sesión.';
        adminPinStatus.style.color = '#e10613';
      });
    });

    adminPasswordInput?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleAdminLogin().catch(error => {
          adminPinStatus.textContent = error.message || 'No se pudo iniciar sesión.';
          adminPinStatus.style.color = '#e10613';
        });
      }
    });

    adminLogoutBtn?.addEventListener('click', () => {
      signOutAdmin().catch(error => {
        setSaveStatus(error.message || 'No se pudo cerrar sesión.', 'error');
      });
    });

    // Event listeners para tabs del admin
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Actualizar tabs activos
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Mostrar panel correspondiente
        document.querySelectorAll('.admin-panel').forEach(panel => {
          panel.classList.toggle('active', panel.id === `${targetTab}Panel`);
        });
      });
    });

    // Event listeners para gestión de pedidos
    const adminOrdersList = $('adminOrdersList');
    const refreshOrdersBtn = $('refreshOrdersBtn');

    refreshOrdersBtn?.addEventListener('click', () => {
      refreshOrders().catch(error => {
        console.warn('No se pudieron cargar los pedidos:', error);
        setSaveStatus('Error al cargar pedidos', 'error');
      });
    });

    adminOrdersList?.addEventListener('click', event => {
      // Handler para actualizar estado
      if (event.target.closest('.update-status-btn')) {
        Promise.resolve(handleOrderStatusUpdate(event)).catch(error => {
          console.warn('No se pudo actualizar el pedido:', error);
          setSaveStatus(error.message || 'No se pudo actualizar el estado.', 'error');
        });
        return;
      }
      
      // Handler para eliminar pedido
      if (event.target.closest('.delete-order-btn')) {
        Promise.resolve(handleOrderDelete(event)).catch(error => {
          console.warn('No se pudo eliminar el pedido:', error);
          setSaveStatus(error.message || 'No se pudo eliminar el pedido.', 'error');
        });
        return;
      }
    });

    // Cargar pedidos al iniciar si hay sesión
    if (session) {
      refreshOrders().catch(error => {
        console.warn('No se pudieron cargar pedidos iniciales:', error);
      });
    }

    subscribeToProductsRealtime(() => {
      getSupabaseSession()
        .then(session => {
          if (!session) {
            return;
          }
          return refreshProducts();
        })
        .catch(error => {
          console.warn('No se pudo refrescar el panel admin en tiempo real:', error);
        });
    });
  }

  return { init };
}

function init() {
  applyBrandPaletteFromLogo();
  initNavToggle();
  const page = getPage();
  const app = page === 'admin' ? buildAdminApp() : buildStoreApp();
  app.init().catch(error => {
    console.error('Error inicializando la aplicación:', error);
  });
}

init();

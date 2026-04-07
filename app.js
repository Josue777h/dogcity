const DEFAULT_IMAGE = 'images/producto.svg';
const FALLBACK_STORAGE_KEY = 'restaurante-productos-locales';
const CART_STORAGE_KEY = 'restaurante-carrito';
const CUSTOMER_STORAGE_KEY = 'restaurante-cliente';
const PRODUCT_NOTES_STORAGE_KEY = 'restaurante-notas-productos';
const ORDER_COMMENT_STORAGE_KEY = 'restaurante-comentario-pedido';
const ADMIN_AUTH_STORAGE_KEY = 'dogcity-admin-auth';
const ADMIN_ACCESS_PIN = '1234';
const API_BASE_URL = window.location.port === '5000' ? '' : 'http://127.0.0.1:5000';
const PRODUCTS_API_URL = `${API_BASE_URL}/productos`;
const WHATSAPP_PHONE = '573143243707';
const IS_HTTP_MODE = window.location.protocol.startsWith('http');
let backendAvailable = IS_HTTP_MODE;

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

const fallbackProducts = [
  {
    id: 4,
    name: 'Perro Sencillo',
    price: 6000,
    description: 'Salchicha Delichi, papa ripio crocante, cebolla, queso y salsas de la casa.',
    unit: 'unidad',
    image: 'assets/c__Users_josue_AppData_Roaming_Cursor_User_workspaceStorage_06ad8a56d9bb091a52c0e4127295690d_images_WhatsApp_Image_2026-04-07_at_11.25.49_PM-d3551022-639a-4328-b8f5-0aa287dd40ce.png'
  },
  {
    id: 5,
    name: 'Perro Doble',
    price: 7000,
    description: 'Dos salchichas Delichi, papa ripio crocante, cebolla, queso y salsas de la casa.',
    unit: 'unidad',
    image: 'assets/c__Users_josue_AppData_Roaming_Cursor_User_workspaceStorage_06ad8a56d9bb091a52c0e4127295690d_images_WhatsApp_Image_2026-04-07_at_11.25.49_PM-d3551022-639a-4328-b8f5-0aa287dd40ce.png'
  },
  {
    id: 6,
    name: 'Perro Americano',
    price: 10000,
    description: 'Pan brioche de papa, salchicha zenu, papa ripio crocante, cebolla, queso y salsas de la casa.',
    unit: 'unidad',
    image: 'assets/c__Users_josue_AppData_Roaming_Cursor_User_workspaceStorage_06ad8a56d9bb091a52c0e4127295690d_images_WhatsApp_Image_2026-04-07_at_11.25.49_PM-d3551022-639a-4328-b8f5-0aa287dd40ce.png'
  },
  {
    id: 7,
    name: 'Perro Polaco',
    price: 10000,
    description: 'Pan brioche de papa, salchicha ranchera, papa ripio crocante, cebolla, queso y salsas de la casa.',
    unit: 'unidad',
    image: 'assets/c__Users_josue_AppData_Roaming_Cursor_User_workspaceStorage_06ad8a56d9bb091a52c0e4127295690d_images_WhatsApp_Image_2026-04-07_at_11.25.49_PM-d3551022-639a-4328-b8f5-0aa287dd40ce.png'
  },
  {
    id: 8,
    name: 'Perro Mexicano',
    price: 10000,
    description: 'Pan brioche de papa, salchicha picante, papa ripio crocante, cebolla, queso y salsas de la casa.',
    unit: 'unidad',
    image: 'assets/c__Users_josue_AppData_Roaming_Cursor_User_workspaceStorage_06ad8a56d9bb091a52c0e4127295690d_images_WhatsApp_Image_2026-04-07_at_11.25.49_PM-d3551022-639a-4328-b8f5-0aa287dd40ce.png'
  },
  {
    id: 9,
    name: 'Perro Alemán',
    price: 10000,
    description: 'Pan brioche de papa, salchicha de cerdo ahumada, papa ripio crocante, cebolla, queso y salsas de la casa.',
    unit: 'unidad',
    image: 'assets/c__Users_josue_AppData_Roaming_Cursor_User_workspaceStorage_06ad8a56d9bb091a52c0e4127295690d_images_WhatsApp_Image_2026-04-07_at_11.25.49_PM-d3551022-639a-4328-b8f5-0aa287dd40ce.png'
  },
  {
    id: 1,
    name: 'Hamburguesa clásica',
    price: 18000,
    description: 'Pan suave, carne artesanal, queso y vegetales frescos.',
    unit: 'unidad',
    image: 'images/taza.svg'
  },
  {
    id: 2,
    name: 'Pizza personal',
    price: 17000,
    description: 'Base crocante con salsa de tomate y queso gratinado.',
    unit: 'unidad',
    image: 'images/camiseta.svg'
  },
  {
    id: 3,
    name: 'Papas especiales',
    price: 9000,
    description: 'Papas a la francesa con salsas de la casa.',
    unit: 'porción',
    image: 'images/stickers.svg'
  }
];

const PLACEHOLDER_IMAGES = [
  'images/taza.svg',
  'images/camiseta.svg',
  'images/stickers.svg',
  'images/hat.svg',
  'images/uploads/foto.png'
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

function readLocalJsonProducts() {
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : fallbackProducts;
  } catch (error) {
    console.warn('No se pudo leer productos desde localStorage:', error);
    return fallbackProducts;
  }
}

function writeLocalJsonProducts(products) {
  try {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.warn('No se pudo guardar productos en localStorage:', error);
  }
}

async function apiRequest(url, options = {}) {
  let response;
  try {
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    response = await fetch(url, {
      headers,
      ...options
    });
  } catch (error) {
    error.isNetworkError = true;
    throw error;
  }

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    body = null;
  }

  if (!response.ok) {
    const message = body?.error || 'Ocurrió un error en la solicitud.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
}

function shouldUseLocalFallback(error) {
  return Boolean(
    !IS_HTTP_MODE ||
    error?.isNetworkError ||
    error?.status === 404 ||
    error?.status === 405 ||
    error?.status === 500
  );
}

async function loadProducts() {
  if (!IS_HTTP_MODE) {
    backendAvailable = false;
    return readLocalJsonProducts();
  }

  try {
    const products = await apiRequest(PRODUCTS_API_URL);
    backendAvailable = true;
    return Array.isArray(products) ? products : [];
  } catch (error) {
    backendAvailable = false;
    console.warn('Usando productos locales por falta de backend disponible:', error);
    return readLocalJsonProducts();
  }
}

async function createProduct(product) {
  const payload = product instanceof FormData ? product : product;

  if (!IS_HTTP_MODE || !backendAvailable) {
    const products = readLocalJsonProducts();
    const nextId = products.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
    const normalized = payload instanceof FormData
      ? Object.fromEntries(Array.from(payload.entries()).filter(([key]) => key !== 'imageFile' && key !== 'editingProductId'))
      : payload;
    const saved = { id: nextId, ...normalized, price: Number(normalized.price) };
    writeLocalJsonProducts([...products, saved]);
    return saved;
  }

  try {
    return await apiRequest(PRODUCTS_API_URL, {
      method: 'POST',
      headers: payload instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      body: payload instanceof FormData ? payload : JSON.stringify(payload)
    });
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }
    backendAvailable = false;
    const products = readLocalJsonProducts();
    const nextId = products.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
    const normalized = payload instanceof FormData
      ? Object.fromEntries(Array.from(payload.entries()).filter(([key]) => key !== 'imageFile' && key !== 'editingProductId'))
      : payload;
    const saved = { id: nextId, ...normalized, price: Number(normalized.price) };
    writeLocalJsonProducts([...products, saved]);
    return saved;
  }
}

async function deleteProduct(productId) {
  if (!IS_HTTP_MODE || !backendAvailable) {
    const products = readLocalJsonProducts().filter(product => Number(product.id) !== Number(productId));
    writeLocalJsonProducts(products);
    return;
  }

  try {
    await apiRequest(`${PRODUCTS_API_URL}/${productId}`, { method: 'DELETE' });
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }
    backendAvailable = false;
    const products = readLocalJsonProducts().filter(product => Number(product.id) !== Number(productId));
    writeLocalJsonProducts(products);
  }
}

async function updateProduct(productId, productData) {
  const payload = productData instanceof FormData ? productData : productData;

  if (!IS_HTTP_MODE || !backendAvailable) {
    const products = readLocalJsonProducts().map(product => (
      Number(product.id) === Number(productId)
        ? {
          ...product,
          ...(payload instanceof FormData
            ? Object.fromEntries(Array.from(payload.entries()).filter(([key]) => key !== 'imageFile' && key !== 'editingProductId'))
            : payload),
          id: Number(productId),
          price: Number(payload instanceof FormData ? payload.get('price') : payload.price)
        }
        : product
    ));
    writeLocalJsonProducts(products);
    return products.find(product => Number(product.id) === Number(productId));
  }

  try {
    return await apiRequest(`${PRODUCTS_API_URL}/${productId}`, {
      method: 'PUT',
      headers: payload instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      body: payload instanceof FormData ? payload : JSON.stringify(payload)
    });
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }
    backendAvailable = false;
    const products = readLocalJsonProducts().map(product => (
      Number(product.id) === Number(productId)
        ? {
          ...product,
          ...(payload instanceof FormData
            ? Object.fromEntries(Array.from(payload.entries()).filter(([key]) => key !== 'imageFile' && key !== 'editingProductId'))
            : payload),
          id: Number(productId),
          price: Number(payload instanceof FormData ? payload.get('price') : payload.price)
        }
        : product
    ));
    writeLocalJsonProducts(products);
    return products.find(product => Number(product.id) === Number(productId));
  }
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

    if (selectedItems.length === 0) {
      orderSummary.textContent = 'No hay productos seleccionados.';
      resetGeneratedMessage();
      return;
    }

    orderSummary.innerHTML = selectedItems
      .map(item => `<span>${item.quantity} x ${escapeHtml(item.name)} = <strong>${formatMoney(item.quantity * item.price)}</strong></span>`)
      .join('<br>');
  }

  function buildWhatsAppMessage(items) {
    const lineItems = items.map(item => {
      const note = (state.notes[item.id] || '').trim();
      return note
        ? `- ${item.quantity} ${item.name} (${note})`
        : `- ${item.quantity} ${item.name}`;
    }).join('\n');
    const total = formatMoney(items.reduce((sum, item) => sum + item.quantity * item.price, 0));
    const name = customerName.value.trim();
    const address = customerAddress.value.trim();
    const phone = customerPhone.value.trim();
    const comment = orderComment?.value.trim() || 'Sin comentarios adicionales.';
    const locationLine = `Ubicacion en mapa: ${state.locationLink}`;

    return [
      'Hola, quiero realizar el siguiente pedido:',
      '',
      'Detalle del pedido:',
      lineItems,
      '',
      `Total: ${total}`,
      '',
      `Comentarios: ${comment}`,
      '',
      `Nombre: ${name}`,
      `Direccion: ${address}`,
      `Telefono: ${phone}`,
      locationLine,
      '',
      'Gracias'
    ].join('\n');
  }

  function refreshLocationRequiredState() {
    const locationBox = locationStatus.closest('.location-box');
    const hasLocation = Boolean(state.locationLink);
    locationBox?.classList.toggle('is-required', !hasLocation);
  }

  function updateLocation() {
    if (!navigator.geolocation) {
      locationStatus.textContent = 'Tu navegador no soporta geolocalización.';
      return;
    }

    locationBtn.disabled = true;
    locationBtn.textContent = 'Ubicando...';
    locationStatus.textContent = 'Solicitando tu ubicación actual...';

    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      state.locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      state.locationLabel = 'Ubicación actual agregada correctamente.';
      locationStatus.textContent = state.locationLabel;
      locationBtn.disabled = false;
      locationBtn.textContent = 'Actualizar ubicación';
      saveCustomerInfo();
      refreshLocationRequiredState();
    }, () => {
      locationStatus.textContent = 'No fue posible obtener tu ubicación. Es obligatoria para enviar el pedido.';
      state.locationLink = '';
      state.locationLabel = '';
      locationBtn.disabled = false;
      locationBtn.textContent = 'Usar mi ubicación actual';
      saveCustomerInfo();
      refreshLocationRequiredState();
    }, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  }

  function generateMessage() {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      resetGeneratedMessage();
      generatedMessage.value = 'Selecciona al menos un producto antes de generar el pedido.';
      return;
    }

    if (!state.locationLink) {
      resetGeneratedMessage();
      generatedMessage.value = 'La ubicación es obligatoria. Presiona "Usar mi ubicación actual" para continuar.';
      locationStatus.textContent = 'La ubicación es obligatoria para enviar el pedido.';
      refreshLocationRequiredState();
      locationBtn.focus();
      return;
    }

    saveCustomerInfo();
    saveOrderComment();
    refreshLocationRequiredState();
    const message = buildWhatsAppMessage(selectedItems);
    generatedMessage.value = message;
    whatsappLink.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    whatsappLink.classList.remove('disabled');
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
    generateBtn.addEventListener('click', generateMessage);
    mobileGenerateBtn?.addEventListener('click', generateMessage);
    locationBtn.addEventListener('click', updateLocation);
    copyBtn.addEventListener('click', () => {
      copyMessage().catch(error => {
        console.warn('No se pudo copiar el mensaje:', error);
      });
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
  const adminPinInput = $('adminPinInput');
  const adminPinBtn = $('adminPinBtn');
  const adminPinStatus = $('adminPinStatus');

  function setSaveStatus(message, tone = 'neutral') {
    saveStatus.textContent = message;
    saveStatus.dataset.tone = tone;
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
    return {
      name: formData.get('name').trim(),
      price: Number(formData.get('price')),
      description: formData.get('description').trim(),
      image: pickPlaceholderImage(formData.get('name')?.length || 0),
      unit: formData.get('unit').trim() || 'unidad'
    };
  }

  function updateImagePreview(source) {
    imagePreview.src = source || pickPlaceholderImage(1);
  }

  function buildProductPayload() {
    const formData = new FormData(newProductForm);
    const file = imageFileInput.files?.[0];

    if (!file) {
      return buildProductFromForm(formData);
    }

    formData.set('image', pickPlaceholderImage(formData.get('name')?.length || 0));
    return formData;
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
    adminFormDescription.textContent = 'Los cambios se guardan en JSON y se reflejan de inmediato en la tienda.';
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

  async function handleSubmit(event) {
    event.preventDefault();
    const product = buildProductPayload();
    const dataForValidation = product instanceof FormData
      ? buildProductFromForm(product)
      : product;
    const validationError = validateProduct(dataForValidation);

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

  function ensureAdminAccess() {
    const hasAccess = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === '1';
    if (hasAccess) {
      adminAccessGate?.classList.add('hidden');
      return true;
    }

    adminAccessGate?.classList.remove('hidden');
    adminPinBtn?.addEventListener('click', () => {
      const pin = (adminPinInput?.value || '').trim();
      if (pin === ADMIN_ACCESS_PIN) {
        localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, '1');
        adminAccessGate?.classList.add('hidden');
        adminPinStatus.textContent = 'Acceso concedido.';
        adminPinStatus.style.color = '#16a34a';
      } else {
        adminPinStatus.textContent = 'PIN incorrecto. No tienes acceso al panel admin.';
        adminPinStatus.style.color = '#e10613';
      }
    });
    return false;
  }

  async function init() {
    ensureAdminAccess();
    await refreshProducts();
    resetForm();
    if (!IS_HTTP_MODE) {
      setSaveStatus('Modo local activo: los productos se guardan en localStorage. Ejecuta Flask para sincronizar con productos.json.', 'warning');
    } else if (!backendAvailable) {
      setSaveStatus('Backend no disponible: se está usando localStorage temporalmente. Inicia Flask para guardar en productos.json.', 'warning');
    } else {
      setSaveStatus('Conectado con Flask: los productos se guardan en productos.json.', 'success');
    }
    newProductForm.addEventListener('submit', event => {
      handleSubmit(event).catch(error => {
        console.warn('No se pudo guardar el producto:', error);
        setSaveStatus(error.message || 'No se pudo guardar el producto.', 'error');
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
  }

  return { init };
}

function init() {
  applyBrandPaletteFromLogo();
  const page = getPage();
  const app = page === 'admin' ? buildAdminApp() : buildStoreApp();
  app.init().catch(error => {
    console.error('Error inicializando la aplicación:', error);
  });
}

init();

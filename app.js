const DEFAULT_IMAGE = 'images/producto.svg';
const FALLBACK_STORAGE_KEY = 'restaurante-productos-locales';
const CART_STORAGE_KEY = 'restaurante-carrito';
const CUSTOMER_STORAGE_KEY = 'restaurante-cliente';
const API_BASE_URL = window.location.port === '5000' ? '' : 'http://127.0.0.1:5000';
const PRODUCTS_API_URL = `${API_BASE_URL}/productos`;
const WHATSAPP_PHONE = '573143243707';
const IS_HTTP_MODE = window.location.protocol.startsWith('http');
let backendAvailable = IS_HTTP_MODE;

const fallbackProducts = [
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
    search: '',
    sort: 'featured'
  };

  const productsList = $('productsList');
  const productsEmptyState = $('productsEmptyState');
  const orderSummary = $('orderSummary');
  const orderTotal = $('orderTotal');
  const selectedCount = $('selectedCount');
  const generatedMessage = $('generatedMessage');
  const whatsappLink = $('whatsappLink');
  const generateBtn = $('generateBtn');
  const copyBtn = $('copyBtn');
  const searchInput = $('searchInput');
  const sortSelect = $('sortSelect');
  const customerName = $('customerName');
  const customerAddress = $('customerAddress');
  const customerPhone = $('customerPhone');

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
      phone: customerPhone.value.trim()
    };
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(payload));
  }

  function loadCustomerInfo() {
    try {
      const info = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY) || '{}');
      customerName.value = info.name || '';
      customerAddress.value = info.address || '';
      customerPhone.value = info.phone || '';
    } catch (error) {
      customerName.value = '';
      customerAddress.value = '';
      customerPhone.value = '';
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

      return `
        <article class="product-card">
          <img src="${escapeHtml(product.image || DEFAULT_IMAGE)}" alt="${escapeHtml(product.name)}" loading="lazy" />
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
    const lineItems = items.map(item => `- ${item.quantity} ${item.name}`).join('\n');
    const total = formatMoney(items.reduce((sum, item) => sum + item.quantity * item.price, 0));
    const name = customerName.value.trim();
    const address = customerAddress.value.trim();
    const phone = customerPhone.value.trim();

    return [
      'Hola, quiero hacer un pedido:',
      '',
      '🛒 Pedido:',
      lineItems,
      '',
      `💰 Total: ${total}`,
      '',
      `👤 Nombre: ${name}`,
      `📍 Dirección: ${address}`,
      `📞 Teléfono: ${phone}`,
      '',
      'Gracias 🙌'
    ].join('\n');
  }

  function generateMessage() {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      resetGeneratedMessage();
      generatedMessage.value = 'Selecciona al menos un producto antes de generar el pedido.';
      return;
    }

    saveCustomerInfo();
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

    productsList.querySelectorAll(`input[data-product-id="${productId}"]`).forEach(input => {
      input.value = nextValue;
    });

    updateOrderDisplay();
    resetGeneratedMessage();
    saveCart();
  }

  function handleProductControls(event) {
    const button = event.target.closest('.qty-btn');
    const input = event.target.closest('input[data-product-id]');

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
  }

  async function init() {
    state.products = await loadProducts();
    const savedCart = loadCart();
    state.quantities = state.products.reduce((accumulator, product) => {
      accumulator[product.id] = Number(savedCart[product.id] || 0);
      return accumulator;
    }, {});

    loadCustomerInfo();
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

    productsList.addEventListener('click', handleProductControls);
    productsList.addEventListener('input', handleProductControls);
    generateBtn.addEventListener('click', generateMessage);
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
  const imageUrlInput = $('imageUrlInput');
  const imageFileInput = $('imageFileInput');
  const imagePreview = $('imagePreview');

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
      image: formData.get('image').trim() || DEFAULT_IMAGE,
      unit: formData.get('unit').trim() || 'unidad'
    };
  }

  function updateImagePreview(source) {
    imagePreview.src = source || DEFAULT_IMAGE;
  }

  function buildProductPayload() {
    const formData = new FormData(newProductForm);
    const file = imageFileInput.files?.[0];

    if (!file) {
      return buildProductFromForm(formData);
    }

    formData.set('image', imageUrlInput.value.trim() || DEFAULT_IMAGE);
    return formData;
  }

  function resetForm() {
    state.editingProductId = null;
    editingProductId.value = '';
    newProductForm.reset();
    newProductForm.elements.unit.value = 'unidad';
    newProductForm.elements.image.value = DEFAULT_IMAGE;
    imageFileInput.value = '';
    updateImagePreview(DEFAULT_IMAGE);
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
    newProductForm.elements.image.value = product.image || DEFAULT_IMAGE;
    imageFileInput.value = '';
    updateImagePreview(product.image || DEFAULT_IMAGE);
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
        <img src="${escapeHtml(product.image || DEFAULT_IMAGE)}" alt="${escapeHtml(product.name)}" loading="lazy" />
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

  async function init() {
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

    imageUrlInput.addEventListener('input', () => {
      if (!imageFileInput.files?.length) {
        updateImagePreview(imageUrlInput.value.trim() || DEFAULT_IMAGE);
      }
    });

    imageFileInput.addEventListener('change', () => {
      const file = imageFileInput.files?.[0];
      if (!file) {
        updateImagePreview(imageUrlInput.value.trim() || DEFAULT_IMAGE);
        return;
      }

      const localUrl = URL.createObjectURL(file);
      updateImagePreview(localUrl);
    });
  }

  return { init };
}

function init() {
  const page = getPage();
  const app = page === 'admin' ? buildAdminApp() : buildStoreApp();
  app.init().catch(error => {
    console.error('Error inicializando la aplicación:', error);
  });
}

init();

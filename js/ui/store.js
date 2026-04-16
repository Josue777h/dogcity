import { 
  $, 
  formatMoney, 
  escapeHtml, 
  resolveProductImage, 
  playNewOrderSound 
} from '../utils.js';
import { 
  loadProducts, 
  saveOrderToSupabase,
  seedDefaultCatalogIfEmpty, 
  uploadProductImage, 
  uploadOrderReceipt,
  subscribeToProductsRealtime 
} from '../supabase.js';
import { 
  CART_STORAGE_KEY, 
  WHATSAPP_PHONE, 
  DOGCITY_MENU_PRODUCTS 
} from '../constants.js';
import { 
  saveCart, 
  loadCart, 
  saveCustomerInfo, 
  loadCustomerInfo, 
  saveOrderComment, 
  loadOrderComment, 
  saveProductNotes, 
  loadProductNotes 
} from '../cart.js';
import { showToast } from './toast.js';

export function buildStoreApp() {
  const state = {
    products: [],
    quantities: {},
    notes: {},
    search: '',
    sort: 'featured',
    currentCategory: 'Todos',
    locationLink: '',
    locationLabel: '',
    lastChangedProductId: null,
    currentOrderNumber: null,
    isLoading: true
  };

  const productsList = $('productsList');
  const productsEmptyState = $('productsEmptyState');
  const categoryNav = $('categoryNav');
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
  const deliveryMethodSelect = $('deliveryMethodSelect');
  const paymentMethodSelect = $('paymentMethodSelect');
  const nequiInfoBlock = $('nequiInfoBlock');
  const paymentReceiptInput = $('paymentReceiptInput');
  const receiptImagePreview = $('receiptImagePreview');
  const locationStatus = $('locationStatus');
  const orderComment = $('orderComment');
  const mobileOrderTotal = $('mobileOrderTotal');
  const mobileSelectedCount = $('mobileSelectedCount');
  const floatingOrderTotal = $('floatingOrderTotal');
  const floatingSelectedCount = $('floatingSelectedCount');
  const openOrderModalBtn2 = $('openOrderModalBtn2');
  const locationBox = $('locationBox');
  
  let isGeneratingOrder = false;
  let lastOrderSignature = '';
  let lastOrderId = null;
  let lastOrderCreatedAt = 0;

  function setOrderModalOpen(isOpen) {
    if (!orderModal) return;
    const mobileBar = document.getElementById('mobileBarV3');
    if (isOpen) {
      orderModal.classList.add('is-open');
      if (window.innerWidth <= 900) {
        document.body.style.overflow = 'hidden';
        if (mobileBar) mobileBar.style.display = 'none';
      }
    } else {
      orderModal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (mobileBar) mobileBar.style.display = '';
    }
    orderModal.setAttribute('aria-hidden', String(!isOpen));
  }

  function openOrderModal() {
    setOrderModalOpen(true);
  }

  function closeOrderModal() {
    setOrderModalOpen(false);
  }

  function markOrderDirty() {
    lastOrderSignature = '';
    lastOrderId = null;
    lastOrderCreatedAt = 0;
  }

  function buildOrderSignature(items) {
    const payload = {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        qty: item.quantity,
        price: item.price,
        note: (state.notes[item.id] || '').trim()
      })),
      customer: {
        name: customerName.value.trim(),
        address: customerAddress.value.trim(),
        phone: customerPhone.value.trim()
      },
      comment: orderComment?.value.trim() || '',
      location: state.locationLink || ''
    };
    return JSON.stringify(payload);
  }

  function getVisibleProducts() {
    const search = state.search.trim().toLowerCase();
    let filtered = state.products.filter(product => {
      const matchesSearch = `${product.name} ${product.description}`.toLowerCase().includes(search);
      const matchesCategory = state.currentCategory === 'Todos' || product.categoria === state.currentCategory;
      const isAvailable = product.disponible !== false;
      return matchesSearch && matchesCategory && isAvailable;
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
    state.currentOrderNumber = null;
    if (generatedMessage) generatedMessage.value = '';
    if (whatsappLink) {
      whatsappLink.href = '#';
      whatsappLink.classList.add('disabled');
    }
  }

  function updateOrderDisplay() {
    const selectedItems = getSelectedItems();
    const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const units = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

    if (orderTotal) orderTotal.textContent = formatMoney(total);
    if (selectedCount) selectedCount.textContent = `${units} ${units === 1 ? 'producto seleccionado' : 'productos seleccionados'}`;
    if (mobileOrderTotal) mobileOrderTotal.textContent = formatMoney(total);
    if (mobileSelectedCount) mobileSelectedCount.textContent = `${units} ${units === 1 ? 'producto' : 'productos'}`;
    if (floatingOrderTotal) floatingOrderTotal.textContent = formatMoney(total);
    if (floatingSelectedCount) floatingSelectedCount.textContent = `${units} ${units === 1 ? 'producto' : 'productos'}`;

    if (selectedItems.length === 0) {
      if (orderSummary) orderSummary.textContent = 'No hay productos seleccionados.';
      resetGeneratedMessage();
      return;
    }

    if (orderSummary) {
      orderSummary.innerHTML = selectedItems
        .map(item => `<span>${item.quantity} x ${escapeHtml(item.name)} = <strong>${formatMoney(item.quantity * item.price)}</strong></span>`)
        .join('<br>');
    }
  }

  function renderCategories() {
    if (!categoryNav) return;
    
    const categories = ['Todos', ...new Set(state.products.map(p => p.categoria || 'Varios').filter(Boolean))];
    
    categoryNav.innerHTML = categories.map(cat => `
      <button class="category-tab ${state.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
        ${cat}
      </button>
    `).join('');

    categoryNav.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.currentCategory = tab.dataset.category;
        renderCategories();
        renderProducts();
      });
    });
  }

  function renderSkeletons() {
    if (!productsList) return;
    productsList.innerHTML = Array(6).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton-img skeleton"></div>
        <div class="skeleton-title skeleton"></div>
        <div class="skeleton-text skeleton"></div>
        <div class="skeleton-text skeleton"></div>
        <div class="skeleton-price skeleton"></div>
      </div>
    `).join('');
  }

  function renderProducts() {
    if (state.isLoading) {
      renderSkeletons();
      return;
    }

    const visibleProducts = getVisibleProducts();
    if (productsEmptyState) productsEmptyState.classList.toggle('hidden', visibleProducts.length > 0);

    if (productsList) {
      productsList.innerHTML = visibleProducts.map(product => {
        const quantity = Number(state.quantities[product.id] || 0);
        const note = state.notes[product.id] || '';

        return `
          <article class="product-card ${quantity > 0 ? 'is-active' : ''} ${String(state.lastChangedProductId) === String(product.id) ? 'is-highlight' : ''}">
            <img src="${escapeHtml(resolveProductImage(product, product.id))}" alt="${escapeHtml(product.name)}" loading="lazy" />
            <div class="product-card-body">
              <div class="product-card-head">
                <div>
                  <span class="product-category-tag">${escapeHtml(product.categoria || 'Varios')}</span>
                  <h3>${escapeHtml(product.name)}</h3>
                  <p>${escapeHtml(product.description || 'Sin descripción disponible.')}</p>
                </div>
                <strong>${formatMoney(product.price)}</strong>
              </div>
              <div class="product-card-footer">
                <span class="product-unit">Venta por ${escapeHtml(product.unit || 'unidad')}</span>
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
  }

  function buildWhatsAppMessage(items) {
    const lineItems = items.map(item => {
      const note = (state.notes[item.id] || '').trim();
      return note
        ? `* ${item.quantity} x ${item.name}\n  - Nota: ${note}`
        : `* ${item.quantity} x ${item.name}`;
    }).join('\n');
    const total = formatMoney(items.reduce((sum, item) => sum + item.quantity * item.price, 0));
    const name = customerName.value.trim() || 'Por confirmar';
    const address = customerAddress.value.trim() || 'Por confirmar';
    const phone = customerPhone.value.trim() || 'Por confirmar';
    const comment = orderComment?.value.trim() || 'Sin comentarios adicionales.';
    const locationLine = state.locationLink || 'No compartida';

    return [
      `Hola Dog City \u{1F44B}, quiero hacer un pedido.`,
      '',
      `\u{1F32D} Productos:`,
      lineItems,
      '',
      `\u{1F4B0} Total: ${total}`,
      '',
      `\u{1F464} Datos del cliente:`,
      `* Nombre: ${name}`,
      `* Direccion: ${address}`,
      `* Telefono: ${phone}`,
      '',
      `\u{1F4DD} Comentarios:`,
      comment,
      '',
      `\u{1F4CD} Ubicacion:`,
      locationLine,
      '',
      `Gracias \u{1F64C}`
    ].join('\n');
  }

  function buildTrackingLink(pedidoId) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/tracking.html?id=${pedidoId}&token=${pedidoId}`;
  }

  function refreshLocationRequiredState() {
    const locationBox = locationStatus?.closest('.location-box');
    const hasLocation = Boolean(state.locationLink);
    locationBox?.classList.toggle('is-required', !hasLocation);
  }

  function updateLocation() {
    if (!navigator.geolocation) {
      showToast('Tu navegador no soporta geolocalización.', 'error');
      return;
    }

    locationBtn.disabled = true;
    locationBtn.textContent = 'Ubicando...';
    if (locationStatus) locationStatus.textContent = 'Solicitando tu ubicación actual...';

    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      state.locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      state.locationLabel = 'Ubicación actual agregada correctamente.';
      if (locationStatus) locationStatus.textContent = state.locationLabel;
      locationBtn.disabled = false;
      locationBtn.textContent = 'Actualizar ubicación';
      
      saveCustomerInfo({
        name: customerName.value.trim(),
        address: customerAddress.value.trim(),
        phone: customerPhone.value.trim(),
        locationLink: state.locationLink,
        locationLabel: state.locationLabel
      });
      refreshLocationRequiredState();
      markOrderDirty();
      showToast('Ubicación agregada.', 'success');
    }, error => {
      showToast('No se pudo obtener la ubicación.', 'error');
      state.locationLink = '';
      state.locationLabel = '';
      locationBtn.disabled = false;
      locationBtn.textContent = 'Usar mi ubicación actual';
      refreshLocationRequiredState();
    }, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    });
  }

  async function generateMessage() {
    if (isGeneratingOrder) return;
    
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      showToast('Selecciona al menos un producto.', 'warning');
      return;
    }

    const deliveryMethod = deliveryMethodSelect?.value || 'envio';
    const paymentMethod = paymentMethodSelect?.value || 'efectivo';

    if (deliveryMethod === 'envio' && !state.locationLink) {
      showToast('La ubicación es obligatoria para pedidos a domicilio.', 'error');
      refreshLocationRequiredState();
      locationBtn?.focus();
      return;
    }

    saveCustomerInfo({
      name: customerName.value.trim(),
      address: customerAddress.value.trim(),
      phone: customerPhone.value.trim(),
      locationLink: state.locationLink,
      locationLabel: state.locationLabel
    });
    saveOrderComment(orderComment?.value);

    const message = buildWhatsAppMessage(selectedItems);
    const signature = buildOrderSignature(selectedItems);
    const now = Date.now();

    if (signature && signature === lastOrderSignature && lastOrderId && (now - lastOrderCreatedAt) < 60000) {
      const trackingLinkFinal = buildTrackingLink(lastOrderId);
      const mensajeFinal = `\u{1F9FE} Pedido #${lastOrderId}\n\n${message}\n\n\u{1F517} Seguimiento:\n${trackingLinkFinal}`;
      if (generatedMessage) {
        generatedMessage.value = mensajeFinal;
        whatsappLink.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(mensajeFinal)}`;
        whatsappLink.classList.remove('disabled');
        window.open(whatsappLink.href, '_blank');
      }
      return;
    }

    isGeneratingOrder = true;
    generateBtn.disabled = true;
    if (mobileGenerateBtn) mobileGenerateBtn.disabled = true;

    try {
      let receiptUrl = null;
      if (paymentMethod === 'transferencia' && paymentReceiptInput?.files?.[0]) {
        try {
          showToast('Subiendo comprobante...', 'info');
          receiptUrl = await uploadOrderReceipt(paymentReceiptInput.files[0]);
          console.log('✅ Comprobante subido:', receiptUrl);
        } catch (e) {
          console.error('❌ Error en uploadOrderReceipt:', e);
          showToast('Error subiendo imagen, el pedido se guardará sin ella.', 'warning');
        }
      }

      const itemsJson = selectedItems.map(item => ({
        nombre: item.name,
        cantidad: item.quantity,
        precio: item.price,
        nota: state.notes[item.id] || ''
      }));

      const payload = {
        nombre: customerName.value.trim(),
        telefono: customerPhone.value.trim(),
        direccion: customerAddress.value.trim(),
        ubicacion_link: state.locationLink,
        comentarios: orderComment?.value.trim() || '',
        total: selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
        status: 'nuevo',
        estado: 'nuevo',
        items: itemsJson,
        productos: message,
        entrega_metodo: deliveryMethod,
        pago_metodo: paymentMethod,
        comprobante_url: receiptUrl,
        token: `T-${Date.now()}`
      };

      console.log('📦 Intentando guardar pedido:', payload);

      const pedidoId = await saveOrderToSupabase(payload);

      if (!pedidoId) {
        console.error('❌ Supabase no devolvió ID del pedido.');
        throw new Error('No se recibió ID del pedido.');
      }

      console.log('🚀 Pedido guardado con ID:', pedidoId);

      const trackingLinkFinal = buildTrackingLink(pedidoId);
      const deliveryEmoji = deliveryMethod === 'envio' ? '🛵 Domicilio' : '🏠 Recoger en local';
      const paymentEmoji = paymentMethod === 'efectivo' ? '💵 Efectivo' : '📱 Transferencia Nequi';
      
      const extraInfo = `\n📍 *Entrega:* ${deliveryEmoji}\n💳 *Pago:* ${paymentEmoji}${receiptUrl ? '\n✅ Comprobante adjunto' : ''}`;
      const mensajeFinal = `\u{1F9FE} Pedido #${pedidoId}\n\n${message}${extraInfo}\n\n\u{1F517} Seguimiento:\n${trackingLinkFinal}`;
      
      if (generatedMessage) {
        generatedMessage.value = mensajeFinal;
        whatsappLink.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(mensajeFinal)}`;
        whatsappLink.classList.remove('disabled');
        window.open(whatsappLink.href, '_blank');
      }
      
      lastOrderSignature = signature;
      lastOrderId = pedidoId;
      lastOrderCreatedAt = Date.now();
      showToast('¡Pedido listo para enviar!', 'success');
    } catch (error) {
      console.error('❌ Error crítico al procesar el pedido:', error);
      showToast(`Error: ${error.message || 'Error desconocido'}`, 'error');
    } finally {
      isGeneratingOrder = false;
      generateBtn.disabled = false;
      if (mobileGenerateBtn) mobileGenerateBtn.disabled = false;
    }
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
    saveCart(state.quantities);
    markOrderDirty();
    
    setTimeout(() => {
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
      if (!productId) return;

      const currentValue = Number(state.quantities[productId] || 0);
      const nextValue = button.dataset.action === 'increase' ? currentValue + 1 : Math.max(0, currentValue - 1);
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
      saveProductNotes(state.notes);
      updateOrderDisplay();
      resetGeneratedMessage();
      markOrderDirty();
    }
  }

  async function init() {
    renderSkeletons();
    
    // Inicializar estado desde caché
    state.notes = loadProductNotes();
    state.quantities = loadCart();
    
    const customerInfo = loadCustomerInfo();
    if (customerName) customerName.value = customerInfo.name || '';
    if (customerAddress) customerAddress.value = customerInfo.address || '';
    if (customerPhone) customerPhone.value = customerInfo.phone || '';
    state.locationLink = customerInfo.locationLink || '';
    state.locationLabel = customerInfo.locationLabel || '';
    if (locationStatus) locationStatus.textContent = state.locationLabel || 'Debes agregar tu ubicación actual.';
    
    if (orderComment) orderComment.value = loadOrderComment();

    // Event Listeners
    searchInput?.addEventListener('input', e => {
      state.search = e.target.value;
      renderProducts();
    });

    sortSelect?.addEventListener('change', e => {
      state.sort = e.target.value;
      renderProducts();
    });

    [customerName, customerAddress, customerPhone].forEach(input => {
      input?.addEventListener('input', () => {
        saveCustomerInfo({
          name: customerName.value.trim(),
          address: customerAddress.value.trim(),
          phone: customerPhone.value.trim(),
          locationLink: state.locationLink,
          locationLabel: state.locationLabel
        });
        markOrderDirty();
      });
    });

    orderComment?.addEventListener('input', () => {
      saveOrderComment(orderComment.value);
      resetGeneratedMessage();
      markOrderDirty();
    });

    productsList?.addEventListener('click', handleProductControls);
    productsList?.addEventListener('input', handleProductControls);
    generateBtn?.addEventListener('click', generateMessage);
    mobileGenerateBtn?.addEventListener('click', openOrderModal);
    openOrderModalBtn?.addEventListener('click', openOrderModal);
    openOrderModalBtn2?.addEventListener('click', openOrderModal);
    closeOrderModalBtn?.addEventListener('click', closeOrderModal);
    orderModalBackdrop?.addEventListener('click', closeOrderModal);
    locationBtn?.addEventListener('click', updateLocation);

    paymentMethodSelect?.addEventListener('change', () => {
      if (paymentMethodSelect.value === 'transferencia') {
        nequiInfoBlock?.classList.remove('hidden');
      } else {
        nequiInfoBlock?.classList.add('hidden');
      }
    });

    paymentReceiptInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && receiptImagePreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          receiptImagePreview.src = e.target.result;
          receiptImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else if (receiptImagePreview) {
        receiptImagePreview.src = 'images/taza.svg';
        receiptImagePreview.style.display = 'none';
      }
    });

    deliveryMethodSelect?.addEventListener('change', () => {
      const locationRow = locationBtn?.closest('.location-box');
      if (deliveryMethodSelect.value === 'envio') {
        locationRow?.classList.remove('hidden');
      } else {
        locationRow?.classList.add('hidden');
      }
    });
    
    copyBtn?.addEventListener('click', async () => {
      if (!generatedMessage?.value.trim()) await generateMessage();
      if (generatedMessage?.value.trim()) {
        await navigator.clipboard.writeText(generatedMessage.value);
        showToast('Mensaje copiado al portapapeles', 'info');
      }
    });

    // Carga inicial de productos
    setTimeout(async () => {
      state.products = await loadProducts();
      state.isLoading = false;
      renderCategories();
      renderProducts();
      updateOrderDisplay();
    }, 800);

    // Suscripción en tiempo real
    subscribeToProductsRealtime(async () => {
      state.products = await loadProducts();
      renderCategories();
      renderProducts();
      updateOrderDisplay();
    });
  }

  return { init };
}

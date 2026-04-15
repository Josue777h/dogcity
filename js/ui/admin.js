import { 
  $, 
  formatMoney, 
  escapeHtml, 
  resolveProductImage, 
  pickPlaceholderImage,
  playNewOrderSound 
} from '../utils.js';
import { 
  loadProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct, 
  getSupabaseSession, 
  signInAdmin, 
  signOutAdmin, 
  loadOrders, 
  changeOrderStatus, 
  seedDefaultCatalogIfEmpty, 
  uploadProductImage, 
  subscribeToOrdersRealtime,
  getSupabaseClient 
} from '../supabase.js';
import { getDeliveryDrivers, saveDeliveryDrivers } from '../cart.js';
import { showToast, requestNotificationPermission, showOrderNotification } from './toast.js';

export function buildAdminApp() {
  const state = {
    products: [],
    orders: [],
    drivers: [],
    editingProductId: null,
    charts: {}
  };

  // ── DOM refs ──────────────────────────────────────────────
  const newProductForm      = $('newProductForm');
  const adminProductsList   = $('adminProductsList');
  const adminEmptyState     = $('adminEmptyState');
  const editingProductIdInput = $('editingProductId');
  const adminFormTitle      = $('adminFormTitle');
  const saveProductBtn      = $('saveProductBtn');
  const cancelEditBtn       = $('cancelEditBtn');
  const imageFileInput      = $('imageFileInput');
  const imagePreview        = $('imagePreview');
  const adminAccessGate     = $('adminAccessGate');
  const adminEmailInput     = $('adminEmailInput');
  const adminPasswordInput  = $('adminPasswordInput');
  const adminLoginBtn       = $('adminLoginBtn');
  const adminPinStatus      = $('adminPinStatus');
  const adminLogoutBtn      = $('adminLogoutBtn');
  const ordersList          = $('adminOrdersList');
  const noOrdersMessage     = $('adminOrdersEmptyState');
  const refreshOrdersBtn    = $('refreshOrdersBtn');
  const addDriverBtn        = $('addDriverBtn');
  const driversList         = $('driversList');
  const productsPanel       = $('productsPanel');
  const ordersPanel         = $('ordersPanel');
  const statsPanel          = $('statsPanel');
  const driversPanel        = $('driversPanel');

  // ── Auth ──────────────────────────────────────────────────
  function setAdminAuthenticated(session) {
    const ok = Boolean(session);
    adminAccessGate?.classList.toggle('hidden', ok);
    adminLogoutBtn?.classList.toggle('hidden', !ok);
    newProductForm?.classList.toggle('is-locked', !ok);

    if (ok && adminPinStatus) {
      adminPinStatus.textContent = `✅ Sesión activa: ${session.user.email}`;
      adminPinStatus.style.color = '#16a34a';
      requestNotificationPermission();
    } else if (adminPinStatus) {
      adminPinStatus.textContent = 'Solo usuarios autenticados pueden gestionar productos.';
      adminPinStatus.style.color = '';
    }
  }

  // ── Products ──────────────────────────────────────────────
  function renderProducts() {
    if (adminEmptyState) adminEmptyState.classList.toggle('hidden', state.products.length > 0);
    if (!adminProductsList) return;

    adminProductsList.innerHTML = state.products.map(product => `
      <article class="admin-product-card">
        <img src="${escapeHtml(resolveProductImage(product, product.id))}" alt="${escapeHtml(product.name)}" loading="lazy" />
        <div class="admin-product-body">
          <div>
            <span class="product-category-tag">${escapeHtml(product.categoria || 'Varios')}</span>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description || 'Sin descripción.')}</p>
          </div>
          <div class="admin-product-meta">
            <span>${formatMoney(product.price)}</span>
            <span>${escapeHtml(product.unit || 'unidad')}</span>
            <span class="stock-badge ${product.disponible !== false ? 'is-available' : 'is-out'}">
              ${product.disponible !== false ? '✓ Disponible' : '✗ Agotado'}
            </span>
          </div>
        </div>
        <div class="admin-product-actions">
          <button class="btn btn-secondary edit-product-btn" type="button" data-product-id="${product.id}">✏️ Editar</button>
          <button class="btn btn-danger delete-product-btn" type="button" data-product-id="${product.id}">🗑 Eliminar</button>
        </div>
      </article>
    `).join('');
  }

  function resetForm() {
    state.editingProductId = null;
    if (editingProductIdInput) editingProductIdInput.value = '';
    newProductForm?.reset();
    if (imagePreview) imagePreview.src = pickPlaceholderImage(2);
    if (adminFormTitle) adminFormTitle.textContent = 'Crear producto';
    if (saveProductBtn) saveProductBtn.textContent = '💾 Guardar producto';
    cancelEditBtn?.classList.add('hidden');
  }

  // ── Orders ────────────────────────────────────────────────
  function renderOrders() {
    if (!ordersList) return;
    noOrdersMessage?.classList.toggle('hidden', state.orders.length > 0);

    const statusLabel = { nuevo: 'Nuevo', preparando: 'Preparando', listo: 'Listo' };
    const statusClass = { nuevo: 'status-nuevo', preparando: 'status-preparando', listo: 'status-listo' };

    ordersList.innerHTML = state.orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(order => {
        const status = (order.estado || order.status || 'nuevo').toLowerCase();
        return `
          <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
              <span class="order-number">🧾 Pedido #${order.id}</span>
              <span class="order-status-badge ${statusClass[status] || 'status-nuevo'}">
                ${statusLabel[status] || status}
              </span>
            </div>
            <div class="order-body">
              <div class="order-info-grid">
                <p><span class="info-label">👤 Cliente</span><span>${escapeHtml(order.nombre || 'N/A')}</span></p>
                <p><span class="info-label">📞 Teléfono</span><span>${escapeHtml(order.telefono || 'N/A')}</span></p>
                <p><span class="info-label">📍 Dirección</span><span>${escapeHtml(order.direccion || 'N/A')}</span></p>
                <p><span class="info-label">💰 Total</span><span class="order-total">${formatMoney(order.total || 0)}</span></p>
              </div>
              <div class="order-meta-badges">
                <span class="badge ${order.entrega_metodo === 'recogida' ? 'badge-info' : 'badge-warning'}">
                  ${order.entrega_metodo === 'recogida' ? '🏠 Recoger' : '🛵 Envío'}
                </span>
                <span class="badge ${order.pago_metodo === 'transferencia' ? 'badge-success' : 'badge-secondary'}">
                  ${order.pago_metodo === 'transferencia' ? '📱 Nequi' : '💵 Efectivo'}
                </span>
                ${order.comprobante_url ? `<a href="${order.comprobante_url}" target="_blank" class="badge badge-primary">👁️ Ver Pago</a>` : ''}
              </div>
              ${order.comentarios ? `<p class="order-notes">💬 <em>${escapeHtml(order.comentarios)}</em></p>` : ''}
              <p class="order-date">🕐 ${new Date(order.created_at).toLocaleString('es-CO')}</p>
            </div>
            <div class="order-actions">
              ${status === 'nuevo' ? `<button class="btn btn-warning order-status-btn" data-order-id="${order.id}" data-status="preparando">🍳 Preparando</button>` : ''}
              ${status === 'preparando' ? `<button class="btn btn-success order-status-btn" data-order-id="${order.id}" data-status="listo">✅ Listo</button>` : ''}
              ${status === 'listo' ? `<button class="btn btn-secondary order-status-btn" data-order-id="${order.id}" data-status="nuevo">↩️ Reabrir</button>` : ''}
              ${order.ubicacion_link ? `<button class="btn btn-primary btn-delivery" data-order-id="${order.id}">🚚 Enviar a Domiciliario</button>` : ''}
            </div>
          </div>
        `;
      }).join('');

    ordersList.querySelectorAll('.order-status-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.orderId);
        const nextStatus = btn.dataset.status;
        try {
          await changeOrderStatus(id, nextStatus);
          showToast(`Pedido #${id} → ${nextStatus}`, 'success');
          await loadAndRenderOrders();
        } catch {
          showToast('Error al actualizar pedido', 'error');
        }
      });
    });

    ordersList.querySelectorAll('.btn-delivery').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.orderId);
        const order = state.orders.find(o => Number(o.id) === id);
        if (order) sendToDeliveryMan(order);
      });
    });
  }

  async function loadAndRenderOrders() {
    const prev = state.orders.length;
    state.orders = await loadOrders();
    renderOrders();
    if (statsPanel?.classList.contains('active')) renderStats();
    if (state.orders.length > prev && prev > 0) {
      playNewOrderSound();
      showOrderNotification(state.orders[0]);
    }
  }

  function sendToDeliveryMan(order) {
    const drivers = getDeliveryDrivers();
    if (drivers.length === 0) {
      showToast('Configura al menos un repartidor en la pestaña 🚚 Repartidores', 'warning');
      return;
    }
    let driver = drivers[0];
    if (drivers.length > 1) {
      const names = drivers.map((d, i) => `${i + 1}. ${d.nombre} (${d.numero})`).join('\n');
      const choice = prompt(`Selecciona repartidor:\n${names}`, '1');
      const idx = parseInt(choice) - 1;
      if (isNaN(idx) || !drivers[idx]) return;
      driver = drivers[idx];
    }
    const msg = `🚚 *Entrega Dog City*\n\n📍 *Ubicación:*\n${order.ubicacion_link}\n\n👤 *Cliente:* ${order.nombre}\n📞 *Tel:* ${order.telefono}\n💰 *Total:* ${formatMoney(order.total)}\n${order.entrega_metodo === 'envio' ? '🛵 Domicilio' : '🏠 Recoger en local'}`;
    window.open(`https://wa.me/${driver.numero}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // ── Stats ─────────────────────────────────────────────────
  function renderStats() {
    if (typeof Chart === 'undefined') {
      if (statsPanel) statsPanel.innerHTML = '<p class="empty-state">Cargando Chart.js...</p>';
      return;
    }

    // 1. Productos más vendidos
    const productCounts = {};
    state.orders.forEach(order => {
      try {
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
        items.forEach(item => {
          const name = item.nombre || item.name || 'Desconocido';
          productCounts[name] = (productCounts[name] || 0) + (item.cantidad || 1);
        });
      } catch {}
    });

    const top5 = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    renderChart('bestSellersChart', 'bar', {
      labels: top5.map(p => p[0]),
      datasets: [{
        label: 'Unidades vendidas',
        data: top5.map(p => p[1]),
        backgroundColor: ['#e10613','#f59e0b','#16a34a','#3b82f6','#8b5cf6'],
        borderRadius: 8
      }]
    }, { plugins: { legend: { display: false } } });

    // 2. Ventas últimos 7 días
    const last7 = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const salesByDay = Object.fromEntries(last7.map(d => [d, 0]));
    state.orders.forEach(o => {
      const day = (o.created_at || '').split('T')[0];
      if (day in salesByDay) salesByDay[day] += (o.total || 0);
    });

    renderChart('salesTrendsChart', 'line', {
      labels: last7.map(d => {
        const [, m, dd] = d.split('-');
        return `${dd}/${m}`;
      }),
      datasets: [{
        label: 'Ventas ($)',
        data: last7.map(d => salesByDay[d]),
        fill: true,
        backgroundColor: 'rgba(225, 6, 19, 0.08)',
        borderColor: '#e10613',
        tension: 0.4,
        pointBackgroundColor: '#e10613',
        pointRadius: 5
      }]
    });

    // 3. Horas pico
    const hours = Array(24).fill(0);
    state.orders.forEach(o => { hours[new Date(o.created_at).getHours()]++; });
    renderChart('peakHoursChart', 'bar', {
      labels: hours.map((_, i) => `${i}h`),
      datasets: [{
        label: 'Pedidos',
        data: hours,
        backgroundColor: 'rgba(245,158,11,0.7)',
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 4
      }]
    }, { plugins: { legend: { display: false } } });
  }

  function renderChart(id, type, data, extraOptions = {}) {
    if (state.charts[id]) { state.charts[id].destroy(); delete state.charts[id]; }
    const ctx = $(id);
    if (!ctx) return;
    state.charts[id] = new Chart(ctx, {
      type,
      data,
      options: { responsive: true, maintainAspectRatio: false, ...extraOptions }
    });
  }

  // ── Drivers ───────────────────────────────────────────────
  function renderDrivers() {
    if (!driversList) return;
    state.drivers = getDeliveryDrivers();

    if (state.drivers.length === 0) {
      driversList.innerHTML = `
        <div class="driver-empty">
          <span>🚚</span>
          <p>No hay repartidores configurados.</p>
          <p class="small">Usa el botón "+ Agregar" para añadir uno.</p>
        </div>`;
      return;
    }

    driversList.innerHTML = state.drivers.map((d, i) => `
      <div class="driver-card">
        <div class="driver-avatar">${d.nombre.charAt(0).toUpperCase()}</div>
        <div class="driver-info">
          <strong>${escapeHtml(d.nombre)}</strong>
          <small>📱 ${escapeHtml(d.numero)}</small>
        </div>
        <button class="btn btn-danger delete-driver-btn" data-index="${i}">Eliminar</button>
      </div>
    `).join('');

    driversList.querySelectorAll('.delete-driver-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        state.drivers.splice(idx, 1);
        saveDeliveryDrivers(state.drivers);
        renderDrivers();
        showToast('Repartidor eliminado', 'warning');
      });
    });
  }

  // ── Tabs ──────────────────────────────────────────────────
  function switchTab(target) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.admin-tab[data-tab="${target}"]`)?.classList.add('active');
    [productsPanel, ordersPanel, statsPanel, driversPanel].forEach(p => p?.classList.remove('active'));
    $(`${target}Panel`)?.classList.add('active');
    if (target === 'orders') loadAndRenderOrders();
    if (target === 'stats') renderStats();
    if (target === 'drivers') renderDrivers();
  }

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    const supabase = getSupabaseClient();

    supabase.auth.onAuthStateChange((_, session) => {
      setAdminAuthenticated(session);
      if (session) {
        seedDefaultCatalogIfEmpty()
          .then(() => loadProducts())
          .then(products => { state.products = products; renderProducts(); });
        loadAndRenderOrders();
      }
    });

    const session = await getSupabaseSession();
    setAdminAuthenticated(session);
    if (session) {
      state.products = await loadProducts();
      renderProducts();
      loadAndRenderOrders();
    }

    // Form submit (crear / editar producto)
    newProductForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(newProductForm);
      const file = imageFileInput?.files?.[0];
      try {
        if (saveProductBtn) saveProductBtn.textContent = 'Guardando...';
        let imageUrl = state.products.find(p => p.id === state.editingProductId)?.image;
        if (file) imageUrl = await uploadProductImage(file, fd.get('name'));

        const productData = {
          name: fd.get('name'),
          price: Number(fd.get('price')),
          description: fd.get('description'),
          unit: fd.get('unit') || 'unidad',
          categoria: fd.get('category') || 'Varios',
          disponible: fd.get('disponible') === 'on',
          image: imageUrl
        };

        if (state.editingProductId) {
          await updateProduct(state.editingProductId, productData);
          showToast('Producto actualizado ✅', 'success');
        } else {
          await createProduct(productData);
          showToast('Producto creado ✅', 'success');
        }
        resetForm();
        state.products = await loadProducts();
        renderProducts();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        if (saveProductBtn) saveProductBtn.textContent = '💾 Guardar producto';
      }
    });

    // Editar / Eliminar producto
    adminProductsList?.addEventListener('click', async e => {
      const editBtn = e.target.closest('.edit-product-btn');
      const delBtn  = e.target.closest('.delete-product-btn');

      if (editBtn) {
        const id = Number(editBtn.dataset.productId);
        const product = state.products.find(p => p.id === id);
        if (product) {
          state.editingProductId = id;
          newProductForm.elements.name.value        = product.name;
          newProductForm.elements.price.value       = product.price;
          newProductForm.elements.description.value = product.description;
          newProductForm.elements.unit.value        = product.unit;
          newProductForm.elements.category.value    = product.categoria || '';
          newProductForm.elements.disponible.checked = product.disponible !== false;
          if (imagePreview) imagePreview.src = product.image;
          if (adminFormTitle) adminFormTitle.textContent = `✏️ Editando: ${product.name}`;
          if (saveProductBtn) saveProductBtn.textContent = '💾 Guardar cambios';
          cancelEditBtn?.classList.remove('hidden');
          switchTab('products');
          newProductForm.scrollIntoView({ behavior: 'smooth' });
        }
      }

      if (delBtn) {
        const id = Number(delBtn.dataset.productId);
        if (confirm('¿Eliminar este producto permanentemente?')) {
          await deleteProduct(id);
          showToast('Producto eliminado', 'warning');
          state.products = await loadProducts();
          renderProducts();
        }
      }
    });

    // Cancelar edición
    cancelEditBtn?.addEventListener('click', resetForm);

    // Auth
    adminLoginBtn?.addEventListener('click', async () => {
      try {
        if (adminLoginBtn) adminLoginBtn.textContent = 'Entrando...';
        await signInAdmin(adminEmailInput.value, adminPasswordInput.value);
        showToast('¡Bienvenido! 👋', 'success');
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        if (adminLoginBtn) adminLoginBtn.textContent = 'Entrar al panel';
      }
    });

    adminLoginBtn && adminPasswordInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') adminLoginBtn.click();
    });

    adminLogoutBtn?.addEventListener('click', async () => {
      await signOutAdmin();
      showToast('Sesión cerrada', 'info');
    });

    // Actualizar pedidos
    refreshOrdersBtn?.addEventListener('click', loadAndRenderOrders);

    // Agregar repartidor
    addDriverBtn?.addEventListener('click', () => {
      const nombre = prompt('Nombre del repartidor:')?.trim();
      if (!nombre) return;
      const numero = prompt('Número de WhatsApp (con código de país, ej: 5731...):')?.trim();
      if (!numero) return;
      const drivers = getDeliveryDrivers();
      drivers.push({ nombre, numero });
      saveDeliveryDrivers(drivers);
      renderDrivers();
      showToast(`Repartidor "${nombre}" agregado 🚚`, 'success');
    });

    // Realtime
    subscribeToOrdersRealtime(() => loadAndRenderOrders());

    // Tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Preview de imagen
    imageFileInput?.addEventListener('change', () => {
      const file = imageFileInput.files?.[0];
      if (file && imagePreview) imagePreview.src = URL.createObjectURL(file);
    });
  }

  return { init };
}

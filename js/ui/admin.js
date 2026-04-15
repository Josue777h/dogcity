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
  subscribeToProductsRealtime, 
  subscribeToOrdersRealtime,
  getSupabaseClient 
} from '../supabase.js';
import { SUPABASE_PRODUCT_BUCKET } from '../constants.js';
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

  const newProductForm = $('newProductForm');
  const adminProductsList = $('adminProductsList');
  const adminEmptyState = $('adminEmptyState');
  const editingProductIdInput = $('editingProductId');
  const adminFormTitle = $('adminFormTitle');
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
  const ordersList = $('adminOrdersList');
  const noOrdersMessage = $('adminOrdersEmptyState');
  const refreshOrdersBtn = $('refreshOrdersBtn');
  const addDriverBtn = $('addDriverBtn');
  const driversList = $('driversList');

  function setAdminAuthenticated(session) {
    const isAuthenticated = Boolean(session);
    adminAccessGate?.classList.toggle('hidden', isAuthenticated);
    adminLogoutBtn?.classList.toggle('hidden', !isAuthenticated);
    newProductForm?.classList.toggle('is-locked', !isAuthenticated);

    if (isAuthenticated && adminPinStatus) {
      adminPinStatus.textContent = `Sesión activa como ${session.user.email}.`;
      adminPinStatus.style.color = '#16a34a';
      requestNotificationPermission();
    } else if (adminPinStatus) {
      adminPinStatus.textContent = 'Solo usuarios autenticados pueden gestionar productos.';
      adminPinStatus.style.color = '';
    }
  }

  function renderProducts() {
    if (adminEmptyState) adminEmptyState.classList.toggle('hidden', state.products.length > 0);
    if (adminProductsList) {
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
              <span class="stock-badge ${product.disponible ? 'is-available' : 'is-out'}">
                ${product.disponible ? 'Disponible' : 'Agotado'}
              </span>
            </div>
          </div>
          <div class="admin-product-actions">
            <button class="btn btn-secondary edit-product-btn" type="button" data-product-id="${product.id}">Editar</button>
            <button class="btn btn-danger delete-product-btn" type="button" data-product-id="${product.id}">Eliminar</button>
          </div>
        </article>
      `).join('');
    }
  }

  function renderOrders() {
    if (!ordersList) return;
    if (noOrdersMessage) noOrdersMessage.classList.toggle('hidden', state.orders.length > 0);
    
    ordersList.innerHTML = state.orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(order => {
        const status = (order.estado || order.status || 'nuevo').toLowerCase();
        const statusColors = { nuevo: '#e10613', listo: '#16a34a', preparando: '#f59e0b' };
        
        return `
          <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
              <span class="order-number">Pedido #${order.id}</span>
              <span class="order-status" style="background: ${statusColors[status] || '#6b7280'}; color: white; padding: 4px 12px; border-radius: 6px; font-weight: bold;">
                ${status}
              </span>
            </div>
            <div class="order-body">
              <p><strong>Cliente:</strong> ${escapeHtml(order.nombre || 'N/A')}</p>
              <p><strong>Teléfono:</strong> ${escapeHtml(order.telefono || 'N/A')}</p>
              <p><strong>Dirección:</strong> ${escapeHtml(order.direccion || 'N/A')}</p>
              <p><strong>Total:</strong> ${formatMoney(order.total || 0)}</p>
              ${order.comentarios ? `<p><strong>Notas:</strong> ${escapeHtml(order.comentarios)}</p>` : ''}
              <p style="font-size: 0.8rem; color: #6b7280;">${new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div class="order-actions">
              <div style="display: flex; gap: 8px; flex-wrap: wrap; width: 100%;">
                ${status === 'nuevo' ? `<button class="order-status-btn btn btn-success" data-order-id="${order.id}" data-status="listo">✓ Listo</button>` : ''}
                ${status === 'listo' ? `<button class="order-status-btn btn btn-secondary" data-order-id="${order.id}" data-status="nuevo">← Reabrir</button>` : ''}
                ${order.ubicacion_link ? `<button class="btn-delivery btn btn-success" data-order-id="${order.id}">🚚 Enviar</button>` : ''}
              </div>
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
          showToast(`Pedido #${id} marcado como ${nextStatus}`, 'success');
          await loadAndRenderOrders();
        } catch (e) {
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
    const oldOrdersCount = state.orders.length;
    state.orders = await loadOrders();
    renderOrders();
    if ($('statsPanel')?.classList.contains('active')) renderStats();
    
    // Si hay pedidos nuevos, sonar.
    if (state.orders.length > oldOrdersCount && oldOrdersCount > 0) {
      const newOrder = state.orders[0];
      playNewOrderSound();
      showOrderNotification(newOrder);
    }
  }

  function sendToDeliveryMan(order) {
    const drivers = getDeliveryDrivers();
    if (drivers.length === 0) {
      showToast('Configura al menos un repartidor en la pestaña Repartidores', 'warning');
      return;
    }

    let selectedDriver = drivers[0];
    if (drivers.length > 1) {
      const names = drivers.map((d, i) => `${i + 1}. ${d.nombre}`).join('\n');
      const choice = prompt(`Selecciona repartidor:\n${names}`, '1');
      const index = parseInt(choice) - 1;
      if (isNaN(index) || !drivers[index]) return;
      selectedDriver = drivers[index];
    }

    const msg = `🚚 *Entrega Dog City*\n\n📍 *Ubicación:*\n${order.ubicacion_link}\n\n👤 *Cliente:* ${order.nombre}\n📞 *Tel:* ${order.telefono}\n💰 *Total:* ${formatMoney(order.total)}`;
    window.open(`https://wa.me/${selectedDriver.numero}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  function renderStats() {
    if (typeof Chart === 'undefined') return;
    
    // 1. Productos más vendidos
    const productCounts = {};
    state.orders.forEach(order => {
      try {
        const items = JSON.parse(order.items_json || '[]');
        items.forEach(item => {
          productCounts[item.nombre] = (productCounts[item.nombre] || 0) + (item.cantidad || 1);
        });
      } catch (e) {}
    });

    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    renderChart('bestSellersChart', 'bar', {
      labels: sortedProducts.map(p => p[0]),
      datasets: [{
        label: 'Unidades vendidas',
        data: sortedProducts.map(p => p[1]),
        backgroundColor: 'rgba(225, 6, 19, 0.6)',
        borderColor: '#e10613',
        borderWidth: 1
      }]
    });

    // 2. Ventas por día (últimos 7 días)
    const salesByDay = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(day => salesByDay[day] = 0);
    state.orders.forEach(order => {
      const day = order.created_at.split('T')[0];
      if (salesByDay[day] !== undefined) {
        salesByDay[day] += (order.total || 0);
      }
    });

    renderChart('salesTrendsChart', 'line', {
      labels: last7Days.map(d => d.split('-').slice(1).reverse().join('/')),
      datasets: [{
        label: 'Ventas ($)',
        data: last7Days.map(day => salesByDay[day]),
        fill: true,
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        borderColor: '#16a34a',
        tension: 0.3
      }]
    });

    // 3. Horas pico
    const hours = Array(24).fill(0);
    state.orders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hours[hour]++;
    });

    renderChart('peakHoursChart', 'line', {
      labels: hours.map((_, i) => `${i}:00`),
      datasets: [{
        label: 'Número de pedidos',
        data: hours,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true
      }]
    });
  }

  function renderChart(id, type, data) {
    if (state.charts[id]) state.charts[id].destroy();
    const ctx = $(id);
    if (!ctx) return;
    state.charts[id] = new Chart(ctx, {
      type,
      data,
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  function renderDrivers() {
    if (!driversList) return;
    state.drivers = getDeliveryDrivers();
    
    driversList.innerHTML = state.drivers.map((d, i) => `
      <div class="driver-card">
        <div>
          <strong>${escapeHtml(d.nombre)}</strong><br/>
          <small>${escapeHtml(d.numero)}</small>
        </div>
        <button class="btn btn-danger delete-driver-btn" data-index="${i}">Eliminar</button>
      </div>
    `).join('');

    if (state.drivers.length === 0) {
      driversList.innerHTML = '<p class="empty-state">No hay repartidores configurados.</p>';
    }

    driversList.querySelectorAll('.delete-driver-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        state.drivers.splice(index, 1);
        saveDeliveryDrivers(state.drivers);
        renderDrivers();
        showToast('Repartidor eliminado', 'warning');
      });
    });
  }

  function resetForm() {
    state.editingProductId = null;
    if (editingProductIdInput) editingProductIdInput.value = '';
    newProductForm?.reset();
    if (imagePreview) imagePreview.src = pickPlaceholderImage(2);
    if (adminFormTitle) adminFormTitle.textContent = 'Crear producto';
    if (saveProductBtn) saveProductBtn.textContent = 'Guardar producto';
    cancelEditBtn?.classList.add('hidden');
  }

  async function init() {
    const supabase = getSupabaseClient();
    supabase.auth.onAuthStateChange((_, session) => {
      setAdminAuthenticated(session);
      if (session) {
        seedDefaultCatalogIfEmpty().then(() => loadProducts()).then(products => {
          state.products = products;
          renderProducts();
        });
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

    newProductForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(newProductForm);
      const file = imageFileInput?.files?.[0];
      
      try {
        let imageUrl = state.products.find(p => p.id === state.editingProductId)?.image;
        if (file) {
          imageUrl = await uploadProductImage(file, formData.get('name'));
        }

        const productData = {
          name: formData.get('name'),
          price: Number(formData.get('price')),
          description: formData.get('description'),
          unit: formData.get('unit') || 'unidad',
          categoria: formData.get('category') || 'Varios',
          disponible: formData.get('disponible') === 'on',
          image: imageUrl
        };

        if (state.editingProductId) {
          await updateProduct(state.editingProductId, productData);
          showToast('Producto actualizado', 'success');
        } else {
          await createProduct(productData);
          showToast('Producto creado', 'success');
        }
        resetForm();
        state.products = await loadProducts();
        renderProducts();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    adminProductsList?.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.edit-product-btn');
      const deleteBtn = e.target.closest('.delete-product-btn');

      if (editBtn) {
        const id = Number(editBtn.dataset.productId);
        const product = state.products.find(p => p.id === id);
        if (product) {
          state.editingProductId = id;
          newProductForm.elements.name.value = product.name;
          newProductForm.elements.price.value = product.price;
          newProductForm.elements.description.value = product.description;
          newProductForm.elements.unit.value = product.unit;
          newProductForm.elements.category.value = product.categoria || '';
          newProductForm.elements.disponible.checked = product.disponible !== false;
          if (imagePreview) imagePreview.src = product.image;
          if (adminFormTitle) adminFormTitle.textContent = `Editando: ${product.name}`;
          if (saveProductBtn) saveProductBtn.textContent = 'Guardar cambios';
          cancelEditBtn?.classList.remove('hidden');
        }
      }

      if (deleteBtn) {
        const id = Number(deleteBtn.dataset.productId);
        if (confirm('¿Eliminar este producto?')) {
          await deleteProduct(id);
          showToast('Producto eliminado', 'warning');
          state.products = await loadProducts();
          renderProducts();
        }
      }
    });

    adminLoginBtn?.addEventListener('click', async () => {
      try {
        await signInAdmin(adminEmailInput.value, adminPasswordInput.value);
        showToast('Bienvenido', 'success');
      } catch (e) {
        showToast(e.message, 'error');
      }
    });

    adminLogoutBtn?.addEventListener('click', async () => {
      await signOutAdmin();
      showToast('Sesión cerrada', 'info');
    });

    refreshOrdersBtn?.addEventListener('click', loadAndRenderOrders);

    addDriverBtn?.addEventListener('click', () => {
      const nombre = prompt('Nombre del repartidor:');
      if (!nombre) return;
      const numero = prompt('Número de WhatsApp (con código de país, ej: 573...):');
      if (!numero) return;
      
      const drivers = getDeliveryDrivers();
      drivers.push({ nombre, numero });
      saveDeliveryDrivers(drivers);
      renderDrivers();
      showToast('Repartidor agregado', 'success');
    });

    subscribeToOrdersRealtime(() => loadAndRenderOrders());

    const adminTabs = document.querySelectorAll('.admin-tab');
    const statsPanel = $('statsPanel');
    const driversPanel = $('driversPanel');

    adminTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        adminTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Ocultar todos
        [productsPanel, ordersPanel, statsPanel, driversPanel].forEach(p => p?.classList.remove('active'));
        
        const targetPanel = $(`${target}Panel`);
        if (targetPanel) targetPanel.classList.add('active');
        
        if (target === 'orders') loadAndRenderOrders();
        if (target === 'stats') renderStats();
        if (target === 'drivers') renderDrivers();
      });
    });
  }

  return { init };
}

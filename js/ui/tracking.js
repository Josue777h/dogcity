import { getSupabaseClient } from '../supabase.js';
import { formatMoney, $ } from '../utils.js';

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get('id'),
    token: params.get('token')
  };
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusInfo(status) {
  const statusMap = {
    'nuevo': { class: 'status-nuevo', text: '🆕 Nuevo' },
    'preparando': { class: 'status-preparando', text: '👨‍🍳 Preparando' },
    'listo': { class: 'status-listo', text: '✅ Listo para entregar' },
    'entregado': { class: 'status-entregado', text: '🚚 Entregado' }
  };
  return statusMap[status] || { class: 'status-nuevo', text: status || 'Nuevo' };
}

async function loadOrder() {
  const { id, token } = getUrlParams();

  if (!id) {
    showError();
    return;
  }

  try {
    const supabase = getSupabaseClient();
    
    // Consultar pedido. Si hay token se valida, si no se permite ver por ID (flexibilidad)
    let query = supabase.from('pedidos').select('*').eq('id', id);
    if (token) query = query.eq('token', token);
    
    const { data, error } = await query.single();

    if (error || !data) throw new Error('Pedido no encontrado');
    showOrder(data);
  } catch (error) {
    console.error('Error cargando pedido:', error);
    showError();
  }
}

function showError() {
  if ($('loadingState')) $('loadingState').style.display = 'none';
  if ($('errorState')) $('errorState').style.display = 'block';
  if ($('orderState')) $('orderState').style.display = 'none';
}

function showOrder(order) {
  if ($('loadingState')) $('loadingState').style.display = 'none';
  if ($('errorState')) $('errorState').style.display = 'none';
  if ($('orderState')) $('orderState').style.display = 'block';

  if ($('orderNumber')) $('orderNumber').textContent = `#${order.id}`;
  if ($('customerName')) $('customerName').textContent = order.nombre || 'Por confirmar';
  if ($('customerAddress')) $('customerAddress').textContent = order.direccion || 'Por confirmar';
  if ($('orderDate')) $('orderDate').textContent = formatDate(order.created_at);
  if ($('orderTotal')) $('orderTotal').textContent = formatMoney(order.total);
  if ($('orderProducts')) $('orderProducts').textContent = order.productos || 'Sin productos';

  const statusInfo = getStatusInfo(order.estado || order.status);
  const statusEl = $('orderStatus');
  if (statusEl) {
    statusEl.className = `status-badge ${statusInfo.class}`;
    statusEl.textContent = statusInfo.text;
  }
}

document.addEventListener('DOMContentLoaded', loadOrder);

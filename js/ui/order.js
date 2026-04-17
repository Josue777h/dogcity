import { getSupabaseClient } from '../supabase.js';

/**
 * Módulo de Seguimiento de Pedidos (Tracking)
 * Proporciona la lógica para cargar, mostrar y actualizar el estado de un pedido en tiempo real.
 */

const states = ['nuevo', 'preparando', 'listo'];

const stateTexts = {
  'nuevo':      { icon: '📋', title: 'Recibido', desc: '¡Recibimos tu pedido en la cocina!' },
  'preparando': { icon: '👨‍🍳', title: 'Preparando', desc: 'Tus perros calientes están en el fuego.' },
  'listo':      { icon: '🛵', title: '¡Listo!', desc: 'Tu pedido está listo o en camino.' }
};

function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-CO');
}

export function buildTrackingUI(container) {
  let realtimeChannel = null;
  let pollingInterval = null;

  function showError(msg) {
    container.innerHTML = `
      <div class="admin-card-v3" style="text-align:center;">
        <h2 style="font-size:3rem; margin-bottom:10px;">😕</h2>
        <p style="color:#e53e3e; font-weight:700;">${msg}</p>
        <a href="index.html" class="back-btn-v3">Volver a la tienda</a>
      </div>
    `;
  }

  function render(order) {
    const status = (order.estado || 'nuevo').toLowerCase();
    const curIdx = states.indexOf(status);

    let timelineHtml = states.map((s, i) => {
      const isActive = curIdx === i;
      const isCompleted = curIdx > i;
      const info = stateTexts[s];
      
      return `
        <div class="timeline-item-v3 ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
          <div class="timeline-icon-v3 ${isActive ? 'pulse-amber' : ''}">
            ${isCompleted ? '✅' : info.icon}
          </div>
          <div class="timeline-content-v3">
            <h3>${info.title}</h3>
            <p>${info.desc}</p>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="admin-card-v3">
        <div style="text-align:center; margin-bottom:20px;">
          <h3 style="font-size:1.2rem; margin-bottom:5px;">Pedido #${order.id}</h3>
          <span class="stock-badge ${status === 'listo' ? 'is-available' : 'is-warning'}" style="font-size:0.75rem; padding:6px 15px;">
            ${status === 'nuevo' ? 'Orden Recibida' : status === 'preparando' ? 'En Preparación' : 'Listo para Entrega'}
          </span>
        </div>

        <div class="status-timeline-v3">
          ${timelineHtml}
        </div>

        <div class="order-details-box">
          <div class="detail-row"><span>👤 Cliente</span><span>${order.nombre}</span></div>
          <div class="detail-row"><span>💰 Total</span><span style="color:#c53030;">${formatMoney(order.total)}</span></div>
          <div class="detail-row" style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
            <span>📍 Entrega</span><span style="font-size:0.75rem; max-width:60%; text-align:right;">${order.direccion}</span>
          </div>
        </div>

        <a href="index.html" class="back-btn-v3">← Volver a la tienda</a>
      </div>

      ${status === 'listo' ? `
        <div class="admin-card-v3" style="margin-top:15px; background:#e8f5e9; border-color:#2563eb33; text-align:center;">
          <p style="margin:0; font-weight:700; color:#2e7d32; font-size:0.85rem;">
            🥳 ¡Tu pedido está listo! Prepara el apetito.
          </p>
        </div>
      ` : ''}
    `;
  }

  async function loadAndTrack(orderId) {
    try {
      const supabase = getSupabaseClient();
      
      // Carga inicial
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', Number(orderId))
        .single();

      if (error || !data) {
        showError('❌ El pedido no existe o fue eliminado.');
        return;
      }

      render(data);

      // Realtime
      realtimeChannel = supabase
        .channel(`track-${orderId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${orderId}` }, (payload) => {
          render(payload.new);
        })
        .subscribe();

      // Polling de respaldo
      pollingInterval = setInterval(async () => {
        const { data: updated } = await supabase.from('pedidos').select('*').eq('id', orderId).single();
        if (updated) render(updated);
      }, 5000);

    } catch (err) {
      showError('❌ Error al conectar con el servidor.');
    }
  }

  return {
    init: (orderId) => {
      if (!orderId) {
        showError('No se encontró ID de pedido.');
        return;
      }
      loadAndTrack(orderId);
    },
    cleanup: () => {
      if (realtimeChannel) realtimeChannel.unsubscribe();
      if (pollingInterval) clearInterval(pollingInterval);
    }
  };
}

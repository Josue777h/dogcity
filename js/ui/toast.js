let toastContainer = null;

function getToastContainer() {
  if (toastContainer) return toastContainer;
  
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.dataset.tone = type;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <p class="toast-message">${message}</p>
    </div>
  `;
  
  container.appendChild(toast);
  
  const removeToast = () => {
    toast.classList.add('is-leaving');
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
        toastContainer = null;
      }
    }, 300);
  };
  
  setTimeout(removeToast, duration);
}


// Interceptar alertas globales (opcional, pero útil para migración gradual)
window.alert = (msg) => showToast(msg, 'warning', 4000);

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function showOrderNotification(orderData) {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    const notification = new Notification('🧾 Nuevo Pedido!', {
      body: `Pedido #${orderData.id}\n💰 Total: ${orderData.total}`,
      icon: 'images/uploads/DOGCITY.png',
      tag: 'new-order-' + orderData.id,
      requireInteraction: true
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

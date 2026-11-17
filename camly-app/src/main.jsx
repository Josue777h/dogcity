import './lib/recoveryRedirect'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { clearClientCaches } from './lib/utils'

if (import.meta.env.DEV) {
  clearClientCaches();
}

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    let alreadyRecovered = false;
    try {
      alreadyRecovered = sessionStorage.getItem('negu_preload_recovered') === '1';
      if (!alreadyRecovered) {
        sessionStorage.setItem('negu_preload_recovered', '1');
      }
    } catch (err) {
      console.debug('sessionStorage no disponible:', err);
    }

    if (!alreadyRecovered) {
      event.preventDefault?.();
      clearClientCaches().finally(() => {
        window.location.reload();
      });
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

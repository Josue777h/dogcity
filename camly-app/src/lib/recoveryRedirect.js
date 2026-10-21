// Debe importarse antes que cualquier otro módulo que cree el cliente de Supabase.
//
// Si la URL de redirección no está autorizada en Supabase (Authentication → URL
// Configuration), el enlace del correo aterriza en la raíz del sitio con los
// tokens en el hash (#access_token=...&type=recovery) y el usuario termina en
// la landing. Aquí lo reenviamos a la pantalla correcta conservando el hash,
// para que el cliente de Supabase pueda leer la sesión de recuperación.
const RESET_PATH = '/restablecer-contrasena';

(function redirectRecoveryLink() {
  if (typeof window === 'undefined') return;
  const { pathname, search, hash } = window.location;
  if (pathname === RESET_PATH) return;

  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(search);
  const isRecovery = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';

  if (isRecovery) {
    window.history.replaceState(null, '', `${RESET_PATH}${search}${hash}`);
  }
})();

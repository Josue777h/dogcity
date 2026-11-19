// Debe importarse antes que cualquier otro módulo que cree el cliente de Supabase.
//
// Si la URL de redirección no está autorizada en Supabase (Authentication → URL
// Configuration), el enlace del correo aterriza en la raíz del sitio con los
// tokens en el hash (#access_token=...&type=recovery) y el usuario termina en
// la landing. Aquí lo reenviamos a la pantalla correcta conservando el hash y la
// marca temporal en sessionStorage antes de que Supabase limpie la URL.
const RESET_PATH = '/restablecer-contrasena';
const RECOVERY_SESSION_KEY = 'negu_password_recovery_started_at';

(function redirectRecoveryLink() {
  if (typeof window === 'undefined') return;
  const { pathname, search, hash } = window.location;

  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(search);
  const hasAuthError = Boolean(
    hashParams.get('error') ||
    hashParams.get('error_code') ||
    queryParams.get('error') ||
    queryParams.get('error_code')
  );
  if (hasAuthError) return;

  const isRecovery =
    hashParams.get('type') === 'recovery' ||
    queryParams.get('type') === 'recovery' ||
    (pathname === RESET_PATH && (
      hashParams.has('access_token') ||
      queryParams.has('code') ||
      queryParams.has('token_hash')
    ));

  if (!isRecovery) return;

  try {
    sessionStorage.setItem(RECOVERY_SESSION_KEY, String(Date.now()));
  } catch {
    // ignore storage access issues
  }

  if (pathname !== RESET_PATH) {
    window.history.replaceState(null, '', `${RESET_PATH}${search}${hash}`);
  }
})();

# Plantillas de correo NEGU

Logo remoto: `https://negu.pro/negu-email-logo.png` (el archivo `public/negu-email-logo.png` debe estar publicado en el sitio para que los clientes de correo lo carguen).

## Confirmación de correo

- **Asunto sugerido:** `Confirma tu correo para activar tu cuenta | NEGU`
- **Plantilla HTML:** `confirm-signup.html`
- **Dónde pegarla:** Supabase → Authentication → Email Templates → **Confirm signup**

## Recuperar contraseña

- **Asunto sugerido:** `Restablece tu contraseña | NEGU`
- **Plantilla HTML:** `recovery.html`
- **Dónde pegarla:** Supabase → Authentication → Email Templates → **Reset password**

Ambas usan `{{ .ConfirmationURL }}` en el botón y en el enlace de respaldo; Supabase lo reemplaza con el enlace de cada solicitud.

## URLs autorizadas (obligatorio)

En Supabase → Authentication → **URL Configuration**:

- **Site URL:** `https://negu.pro`
- **Redirect URLs** (agregar todas):
  - `https://negu.pro/restablecer-contrasena`
  - `https://negu.pro/auth/callback`
  - `http://localhost:5173/restablecer-contrasena`
  - `http://localhost:5173/auth/callback`

Si `/restablecer-contrasena` no está en la lista, Supabase ignora el destino y envía al usuario a la raíz del sitio. La app lo reenvía a la pantalla correcta (`src/lib/recoveryRedirect.js`), pero conviene dejar la lista completa.

# Plantillas de correo NEGU

## Confirmación de correo

- **Asunto sugerido:** `Confirma tu correo para activar tu cuenta | NEGU`
- **Plantilla HTML:** `confirm-signup.html`
- **Logo remoto:** `https://negu.pro/negu-email-logo.png`

Para activar la plantilla en Supabase, abre **Authentication → Email Templates → Confirm signup**, pega el contenido de `confirm-signup.html` en el cuerpo HTML y guarda. Usa `{{ .ConfirmationURL }}` en el botón y en el enlace de respaldo; Supabase reemplaza esa variable con el enlace de confirmación de cada cuenta.

El archivo `public/negu-email-logo.png` debe estar publicado en el sitio para que los clientes de correo puedan cargar el logotipo.

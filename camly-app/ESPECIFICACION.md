# NEGU — Especificación técnica

SaaS multi-tenant para comercios (restaurantes, tiendas, farmacias, papelerías). Cada comercio tiene su tienda pública, su panel de administración y sus pedidos. Los clientes compran desde la tienda, reciben cotización de domicilio, confirman y siguen su pedido por token.

Stack: React 19 + Vite (SPA) · Supabase (Postgres, Auth, Storage, RPC, Realtime) · Zustand · Tailwind CSS 4 · Leaflet · Recharts · Netlify (PWA con vite-plugin-pwa).

---

## 1. Mapa de la aplicación

| Área | Ruta / carpeta | Qué hace |
|---|---|---|
| Marketing | `src/features/marketing/` | Landing, páginas SEO por rubro, 404, bienvenida. |
| Legal | `src/features/legal/` | Términos, privacidad y cookies (texto estático). |
| Auth | `src/features/auth/` | Login, registro, verificación de correo, recuperación y reset de contraseña. `AuthGuard` protege el panel. |
| Tienda pública | `src/features/store/` | Catálogo por slug o por mesa (QR), carrito, checkout, personalización de productos, seguimiento del pedido. |
| Panel admin | `src/features/admin/` | Dashboard, pedidos en vivo, comandero de mesas, productos, categorías, repartidores, ingresos y configuración. |
| Librerías | `src/lib/`, `src/services/`, `src/stores/` | Cliente Supabase, utilidades (WhatsApp, recibos, CSV, audio), impresión Bluetooth, estados de pedido, Zustand. |
| Base de datos | `supabase/schema.sql`, `supabase/migrations/` | Tablas, RLS, RPC para el cliente anónimo y para el flujo de cotización. |

### Entidades principales

- **negocios**: el comercio (slug, `business_type`, tema, horario, métodos de pago, coordenadas, costos de domicilio).
- **pedidos**: pedido con `status`/`estado` (espejados por trigger), montos (`subtotal_amount`, `delivery_fee`, `total_amount`), `token` para seguimiento y comprobante de pago.
- **productos**, **categorias**, **domiciliarios**.
- **suscripciones**: plan (`trial` de 7 días, `activo`, `vencido`). **Solo el servidor la escribe.**

### Flujos clave

1. **Pedido a domicilio con cotización**: el cliente crea el pedido (`customer_create_order`) → queda `COTIZACION_PENDIENTE` → el comercio fija el domicilio (`setDeliveryQuote`) → `COTIZACION_ENVIADA` → el cliente acepta (`customer_accept_quote`) → `CONFIRMADO_GRACIA` (ventana de **60 s** para deshacer) → `advance_grace_to_preparation` → `EN_PREPARACION` → `LISTO_PARA_RECOGER` / `EN_CAMINO` → `ENTREGADO`.
2. **Cancelación por el cliente**: `customer_cancel_order` solo si el estado es `COTIZACION_ENVIADA` o `CONFIRMADO_GRACIA` dentro de la ventana. Un trigger lo vuelve a validar en la base de datos.
3. **Mesa (comandero)**: el mesero abre mesa, agrega ítems, imprime comanda (cocina) y cuenta. Hay bloqueo con PIN.
4. **Suscripción**: al registrarse se crea una prueba de 7 días (`create_trial_subscription`). Al vencer, `mark_subscription_expired` la marca como vencida. El acceso se bloquea con `PlanExpiredView`.

### Modelo de seguridad

- RLS por `negocio_id` / `user_id = auth.uid()` en todas las tablas de comercio.
- Clientes anónimos: solo insertan pedidos vía RPC y leen su pedido con `customer_get_order(id, token)`.
- Suscripciones: solo lectura para el dueño; escritura solo mediante RPC `SECURITY DEFINER`.

---

## 2. Cambios aplicados en esta revisión

| Cambio | Archivos | Motivo |
|---|---|---|
| Cierra lectura anónima de todos los pedidos | `schema.sql`, `migrations/20261106_quote_flow_hardening.sql` | La política `USING (token IS NOT NULL)` exponía teléfonos y direcciones de todos los pedidos. |
| Ventana de gracia de 60 s (antes 30 s) | `schema.sql`, `migrations/…hardening.sql`, `TrackingPage.jsx` | Lo pedía la especificación original. Es un cambio de comportamiento. |
| `saveOrder` ya no devuelve un ID falso (`Date.now()`) | `src/lib/supabase.js` | Un ID inventado rompe el seguimiento. Ahora lanza error. |
| Escritura de suscripciones solo por RPC; se elimina el botón DEV "Simular pago" | `BillingModal.jsx`, `schema.sql`, `migrations/20261106_subscription_integrity.sql`, `supabase.js` | Un dueño podía activarse PRO por 30 días desde el cliente. El registro ya no reinicia pruebas existentes. |
| Escape HTML en recibos y comandas | `src/lib/utils.js` (`escapeHtml`) | Nombres, notas y comentarios de clientes se insertaban sin escapar en una ventana con el origen de la app (XSS almacenado). |
| Neutralización de fórmulas en CSV | `src/lib/utils.js` (`csvCell`) | CSV injection: celdas que empiezan con `= + - @`. |
| Eliminados: `Drawer.tsx`, `Modal.tsx`, `Switch.tsx` | `src/components/ui/` | Sin ningún import. |
| Eliminados: `seed-database.mjs`, `seed-pedidos.mjs`, `seed-postre.mjs` | `scripts/` | Scripts de desarrollo que escriben en producción con IDs fijos. Siguen en el historial de git. |
| Enlace roto a `/favicon.svg` eliminado | `index.html` | El archivo no existe. |

Verificación: `vite build` compila sin errores. ESLint en `utils.js` reporta un error en `useAnimatedCounter` (`setState` síncrono dentro de un efecto), que ya existía y no se modificó.

---

## 3. Backlog priorizado (pendiente)

Cada punto viene de la auditoría de solo lectura. Las referencias de línea son de la versión actual del código y deben verificarse antes de editar.

### Prioridad alta — seguridad e integridad

- **Precios manipulables**: `supabase.js` (≈349-363) usa el precio y el domicilio que envía el cliente cuando el producto no está en catálogo o falla la consulta. Confirmar que `customer_create_order` recalcula montos en el servidor; si no, moverlo.
- **Pedido duplicado**: `OrderDrawer.jsx:350-357` y `supabase.js` (≈395-404). Si el pedido se guarda y falla un paso posterior, el reintento crea otro pedido. Usar una clave de idempotencia.
- **Cancelación falsa en la UI**: `TrackingPage.jsx:229-239` marca `CANCELADO` sin llamar al servidor cuando falta id o token.
- **Datos de prueba visibles**: `TrackingPage.jsx:119` usa `DEMO_ORDER` como respaldo; un pedido inexistente muestra "Cliente de Prueba".
- **PIN del comandero**: `ComanderoView.jsx:84` usa `0000` si no hay PIN, y lo guarda en texto plano en localStorage (`:76`).
- **Token de seguimiento**: `ComanderoView.jsx:783` usa `Math.random()`. Generar con `crypto.getRandomValues` o en el servidor.
- **Comandero sobrescribe ítems**: `ComanderoView.jsx:681-693` y `748-760` reemplazan `items` con un snapshot local; dos dispositivos pueden perder platos.
- **Escritura de tenant sin filtro**: `deleteProduct`, `deleteOrder`, `confirmOrderDelivery` y `merchantCancelOrder` no filtran por `negocio_id` (dependen solo de RLS).
- **Validación de comprobantes**: `TrackingPage.jsx:284-297` no valida tamaño ni tipo, aunque la UI dice "hasta 10 MB".
- **Contraseñas**: `RegisterPage.jsx:48` y `ResetPasswordPage.jsx:86` solo exigen 8 caracteres; la UI promete mayúsculas, minúsculas y números.
- **Cabeceras HTTP**: `public/_headers` solo define caché de sitemap y robots. Faltan CSP, `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`.
- **Soft 404**: `netlify.toml` y `_redirects` devuelven 200 en cualquier ruta.
- **Teléfono de respaldo hardcodeado** (`573143243707`): `StorePage.jsx:497`, `TrackingPage.jsx:602,808`.

### Prioridad alta — robustez

- **Pérdida de datos al guardar producto**: `ProductModal.jsx:203-212` cierra el modal y borra el borrador aunque `onSave` falle (`AdminPage.jsx:248-251` traga el error).
- **Recarga que pisa ediciones**: `SettingsView.jsx:349-403` depende de `[business]`, y `AdminPage.jsx:170-174` recarga cada 10 s.
- **Valores que se corrompen**: `SettingsView.jsx:103-105` y `370-371` usan `business.x || default`, así que un `0` real se reemplaza.
- **Registro con cuenta huérfana**: `supabase.js` (≈597-621) crea el usuario antes del negocio; si el negocio falla, el reintento dice "ya registrado".
- **Términos**: `RegisterPage.jsx:66` envía `termsVersion '2026-10-20-v1.1'` y `TermsPage.jsx:67` publica "Versión 1.0".
- **Estado de cuenta**: `stores/index.js:280-284` deja acceso completo si no hay suscripción; combinado con errores silenciosos.
- **Errores genéricos**: `LoginPage.jsx:51` muestra "Correo o contraseña incorrectos" para cualquier error (red, límite de intentos).
- **Mensajes de error crudos**: `RegisterPage.jsx:81` muestra `err.message`.
- **Carrera al cargar tienda**: `StorePage.jsx:104-130` sin `AbortController`; un error deja `business` en null y muestra "Tienda no encontrada".
- **Crash con nulos**: `StorePage.jsx:143` (`a.nombre.localeCompare`) y `:159` (`p.name.toLowerCase()`).
- **Bluetooth**: `bluetoothPrinter.js:38-43` sin try; cancelar el diálogo lanza `DOMException` en inglés. Se añade un listener `gattserverdisconnected` en cada conexión (`:94-97`).
- **`crypto.randomUUID()`** solo existe en contextos seguros (`OrderDrawer.jsx:297`, `orderService.ts:70`).
- **`AuthGuard.jsx:14-16`**: el timeout de 6 s deja `loading=false` antes de que `getSession` resuelva, y redirige a `/login` aunque haya sesión.
- **`App.jsx:62`**: `ErrorBoundary` sin reset por ruta.
- **Pedidos sin paginación**: `supabase.js:299-309` (`limit(50)`).

### Prioridad media — rendimiento

- **Re-render de tarjetas**: `ProductCard.jsx:17` usa `useCartStore()` sin selector; cada cambio del carrito re-renderiza todo el catálogo. Usar selectores y `React.memo`.
- **Dashboard**: `DashboardView.jsx:124-150` hace 14 pasadas sobre `orders`; unificar en una agrupación.
- **Comandero**: `ComanderoView.jsx:1279-1283` recorre el ticket por cada producto en cada render.
- **Pedidos en vivo**: `OrdersView.jsx:757-767` llama `getTabCount` 8 veces por render; falta `useMemo` en filtros.
- **QR**: `SettingsView.jsx:186-271` regenera el QR (700 px) en cada cambio de color, sin debounce.
- **Fuentes**: `index.html:44` y `index.css:1` cargan Google Fonts bloqueando el render; Outfit y Poppins solo se usan como opciones de tema.
- **Imágenes sin dimensiones**: `ProductCard.jsx:257-263`, `StorePage.jsx:270-275`, `SaaSLogo.jsx`, `LandingPage.jsx:153-158`.
- **Polling**: `AdminPage.jsx:170-174` hace 4 consultas cada 10 s además de realtime.
- **Lazy loading**: ya existe por ruta (`App.jsx`); falta `manualChunks` para separar vendors pesados.

### Prioridad media — código muerto y duplicado

- **Sin uso confirmado**: `supabase.js` `signUp` y `subscribeToProducts`; `utils.js` `getBusinessSlug` y `buildDeliveryConfirmationMessage`; `orderService.ts` `buildQuoteWhatsAppUrl`; `stores/index.js` `getCartData`.
- **Imports lucide sin uso**: en casi todas las vistas (ver `grep` de `lucide-react` por archivo).
- **Duplicados**: parseo de `catalog_design` (3 lugares), lógica de slug (3 lugares), búsqueda en `StorePage`, TAB_LABELS en `AdminHeader` y `Sidebar`, cabeceras legales en las páginas legales, lógica Bluetooth y llamadas de mesa entre `ComanderoView` y `OrdersView`.
- **Modo mesa inalcanzable**: `StorePage.jsx:560-567` nunca pasa la mesa a `OrderDrawer`.
- **Tipos**: `DeliveryType` no incluye `dine_in` ni `delivery` (`types/order.ts:11`); `BusinessType` está duplicado.
- **Scripts de build**: `scripts/prerender-marketing-seo.js` sí se usa (`npm run build`).

### Prioridad media — diseño y accesibilidad

- **Modales**: sin `role="dialog"`, `aria-modal`, cierre con Escape ni focus trap (`ProductModal`, `ToppingsManagerModal`, `AiAssistantModal`, `ConfirmModal`, `BillingModal`, `OrderDrawer`).
- **Etiquetas**: muchos inputs sin `htmlFor` o solo con placeholder (`OrderDrawer.jsx:632-664`, `ProductsView.jsx:60-67`, `DriversView.jsx:128-143`).
- **Botones solo icono**: sin `aria-label` (`ComanderoView.jsx:965-971`, `ProductsView.jsx:172-185`, `AiAssistantModal.jsx:407-413`).
- **Estado solo por color**: sin `aria-pressed` ni `aria-checked` en toggles y chips.
- **Objetivos táctiles menores de 40 px**: `StorePage.jsx:315,376,399`, `OrderDrawer.jsx:437,533,544`, `LocationPickerMap.jsx:143-151`.
- **Contraste**: `text-gray-400`/`text-slate-400` sobre blanco (≈2.5:1): `TrackingPage.jsx:557,560`, `LandingPage.jsx:231,713`, `RegisterPage.jsx:266`.
- **Acento de marca inconsistente**: naranja, azul (`#0284C7`) y `bg-brand` conviven entre vistas. Definir un único token.
- **Mensajes de error**: solo como toast (`LoginPage.jsx:49-51`); `ToastContainer.jsx:33` sin `aria-live`.
- **Landing**: tres CTA con etiquetas distintas (`LandingPage.jsx:106-120, 199-212`); claims sin fuente en el repo (`4.9/5`, testimonios en `LandingPage.jsx:644-688`); precio en COP vs USD (`LandingPage.jsx:589` vs `BillingModal.jsx:48,72`).
- **Asistente**: `AiAssistantModal.jsx:205` dice tener "motor propio" y compatibilidad con GPT-4o/Gemini; es un asistente por reglas. Corregir el texto.

---

## 4. Decisiones y riesgos abiertos

- **Ventana de gracia de 60 s**: se aplicó según la especificación original. Si el negocio prefiere 30 s, cambiar en `schema.sql`, en la migración `20261106_quote_flow_hardening.sql` y en `TrackingPage.jsx`.
- **Cobro real**: el repositorio no contiene la integración de pagos. La activación de planes tras un pago debe hacerse desde un proceso del servidor (service role o webhook), no desde el cliente.
- **Migraciones**: `supabase/migrations/` contiene solo los cambios de esta revisión. Aplicarlos en staging antes de producción y probar con un cliente anónimo y con un dueño.
- **Auditoría incompleta de `customer_create_order`**: no se revisó si recalcula precios en el servidor. Es el primer punto del backlog de seguridad.

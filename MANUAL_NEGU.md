# MANUAL_NEGU.md — Manual Técnico y Operativo de NEGU (`negu.pro`)

Documento fuente único de arquitectura, operación, base de datos, UI/UX y despliegue del proyecto **NEGU** (`camly-app/`).

---

## 1. Visión General y Propuesta de Valor

- **Qué es NEGU (`negu.pro`):** Plataforma SaaS multi-tenant que digitaliza el catálogo, la toma de pedidos por WhatsApp, el cálculo de envíos y la operación diaria de pequeños y medianos comercios.
- **Modelo comercial:** Suscripción mensual fija con prueba gratis de 7 días sin tarjeta y **0% de comisión por pedido** (el pago del cliente entra directo al comercio).
- **Rubros soportados (`business_type`):**
  - `food` — Restaurantes, comidas rápidas, cafeterías, pastelerías (habilita comandero/mesas y textos de cocina).
  - `retail` — Tiendas de ropa, calzado, accesorios y regalos (textos de alistamiento y empaque, sin comandero por defecto).
  - `pharmacy` — Farmacias y droguerías.
  - `stationery` — Papelerías y útiles.
  - `general` — Comercios locales y servicios multipropósito.

---

## 2. Arquitectura y Stack Tecnológico

- **Frontend (`camly-app/`):**
  - React 19 + Vite 8 (`vite-plugin-pwa`) + TypeScript / JSX.
  - React Router (SPA), Zustand (estado de carrito multi-tenant, sesión y negocio), Tailwind CSS v4.
  - Leaflet (mapas y cálculo GPS de envío), Recharts (reportes), `lucide-react` (iconografía única), Web Bluetooth API (impresión térmica POS 58mm/80mm).
- **Backend y Base de Datos (Supabase):**
  - PostgreSQL con aislamiento multi-tenant mediante Row Level Security (**RLS**).
  - Supabase Auth (registro, verificación de correo, recuperación y alerta de cambio de contraseña).
  - Supabase Realtime (pedidos entrantes y llamados de mesa en vivo con cleanup en `useEffect`).
  - Supabase Storage (imágenes de productos optimizadas en WebP y comprobantes de pago en bucket `receipts`).
  - Funciones RPC `SECURITY DEFINER` para flujos públicos sin exponer tablas privadas.
- **Despliegue y Dominio:**
  - Hosting en **Netlify** configurado en `netlify.toml` (publica `camly-app/dist`).
  - SPA Routing garantizado vía `camly-app/public/_redirects` (`/* /index.html 200` + redirecciones 301 de `www` y `http` hacia `https://negu.pro`).
  - Prerender SEO en build (`scripts/prerender-marketing-seo.js`) para rutas de marketing.

---

## 3. Mapa de Rutas y Flujos del Sistema

### 3.1 Rutas principales

| Área             | Rutas                                                                                                                                 | Función                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Marketing & SEO  | `/`, `/menu-digital`, `/pedidos-whatsapp`, `/gestion-de-pedidos`, `/para-restaurantes`, `/para-negocios`                              | Adquisición y demostración del producto.                |
| Auth             | `/login`, `/registro`, `/verificar-correo`, `/recuperar-contrasena`, `/restablecer-contrasena`, `/bienvenida`                         | Alta de comercios y seguridad de cuenta.                |
| Catálogo Público | `/:slug`, `/:slug?mesa=N`                                                                                                             | Tienda pública o carta QR en mesa.                      |
| Seguimiento      | `/tracking/:orderId?token=...`                                                                                                        | Estado en vivo, aprobación de cotización y comprobante. |
| Panel Comercio   | `/admin/*` (`dashboard`, `pedidos`, `comandero`, `productos`, `categorias`, `clientes`, `domiciliarios`, `ingresos`, `configuracion`) | Operación completa protegida por `AuthGuard`.           |

### 3.2 Flujo Cliente

1. Abre enlace o QR (`/:slug`), navega categorías/búsqueda y personaliza productos (variantes, tallas, adicionales, notas).
2. Selecciona modalidad: **Domicilio** (tarifa fija, GPS por km o **Por Cotizar**), **Recogida en tienda** o **Mesa**.
3. Envía el pedido estructurado al panel y a WhatsApp del comercio.
4. Monitorea el pedido en `/tracking/:orderId?token=...`:
   - Si el envío es **Por Cotizar**, al llegar `COTIZACION_ENVIADA` ve el desglose (Subtotal, Envío, Total) y elige **Aceptar y Confirmar** o **Rechazar Pedido**.
   - Al confirmar entra en `CONFIRMADO_GRACIA` con **ventana de 60 segundos** para deshacer antes de pasar automáticamente a `EN_PREPARACION`.
   - Sube comprobante de transferencia si aplica y sigue el avance hasta `ENTREGADO`.

### 3.3 Flujo Comercio (`/admin`)

1. Recibe pedidos entrantes en tiempo real con **alerta sonora** configurable por dispositivo (y llamados de mesa si aplica).
2. Para pedidos en `COTIZACION_PENDIENTE`, fija el costo de domicilio (`COTIZACION_ENVIADA`) y abre WhatsApp con el mensaje y enlace de seguimiento listos.
3. Gestiona estados (`EN_PREPARACION` → `LISTO_PARA_RECOGER` / `EN_CAMINO` → `ENTREGADO`), descuenta/restaura stock automáticamente e imprime tickets térmicos POS **58mm / 80mm** por Bluetooth o impresión del sistema.
4. Administra catálogo (fotos, opciones, stock, precios con descuento), horarios, métodos de pago, CRM de clientes, QR y perfil personal independiente del negocio.

---

## 4. Esquema de Base de Datos y Seguridad (Supabase)

### 4.1 Tablas principales (`camly-app/supabase/schema.sql`)

- **`negocios`** _(entidad de tienda/store)_: `id`, `user_id`, `nombre` (slug), `nombre_visible`, `business_type`, `telefono`, `whatsapp_contacto`, `direccion`, `lat`, `lng`, `tipo_domicilio`, `precio_domicilio`, `costo_por_km`, `domicilio_minimo`, `metodos_pago`, `pago_banco`, `pago_alias`, `theme_color`, `color_secundario`, `logo_url`, `horario`, `catalog_design`, `timezone`.
- **`productos`**: `id`, `negocio_id`, `categoria_id`, `nombre`, `precio`, `compare_price`, `stock`, `descripcion`, `imagen`, `opciones`, `disponible`.
- **`categorias`**: `id`, `negocio_id`, `nombre`.
- **`pedidos`**: `id`, `negocio_id`, `token`, `status` / `estado`, `delivery_type` / `tipo_entrega`, `subtotal_amount`, `delivery_fee` / `domicilio_costo`, `total_amount` / `total`, `quote_sent_at`, `confirmed_at`, `cancelled_by`, `cancellation_reason`, `cliente_nombre`, `cliente_telefono`, `direccion`, `items`, `receipt_path`.
- **`suscripciones`**: `id`, `negocio_id`, `plan`, `estado` (`trial`, `activo`, `vencido`), `es_trial`, `fecha_inicio`, `fecha_fin`.
- **`domiciliarios`**: `id`, `negocio_id`, `nombre`, `telefono`, `activo`.

### 4.2 Migraciones activas (`camly-app/supabase/migrations/` — orden de ejecución)

1. `01_subscription_integrity.sql` — Restringe escritura de `suscripciones` exclusivamente a RPCs `SECURITY DEFINER`.
2. `02_quote_shipping_flow.sql` — Asegura `business_type`, columnas de cotización y RPC `cancel_order_customer`.
3. `03_quote_flow_hardening.sql` — Cierra lectura pública masiva de `pedidos` y fija ventana de gracia de 60s.
4. `04_secure_order_pricing.sql` — Trigger `BEFORE INSERT` (`trg_secure_order_pricing`) que blinda montos en servidor.
5. `05_catalog_inventory_columns.sql` — Columnas nativas `compare_price`, `stock` en `productos` y `catalog_design` en `negocios`.

### 4.3 Reglas RLS y Blindaje de Servidor

- **Aislamiento multi-tenant:** Toda tabla de negocio valida pertenencia por `negocio_id` / `user_id = auth.uid()`. El frontend nunca es frontera de seguridad.
- **Clientes anónimos:** Solo leen su propio pedido mediante `customer_get_order(p_order_id, p_token)` (`SECURITY DEFINER`). Prohibidas políticas `USING (token IS NOT NULL)`.
- **Validación de precios (`trg_secure_order_pricing`):** En `BEFORE INSERT` sobre `pedidos` exige `subtotal_amount > 0` y `delivery_fee >= 0` (permite `0` en `por_cotizar`, `manual`, `pickup`, `recogida`, `mesa`), y recalcula `total_amount = subtotal_amount + delivery_fee` en el servidor ante cualquier discrepancia.
- **Cancelación controlada (`cancel_order_customer` / `customer_cancel_order`):** Solo permite cancelar al cliente si el estado es `COTIZACION_ENVIADA` o `CONFIRMADO_GRACIA` dentro de los 60s; bloquea al pasar a `EN_PREPARACION`.
- **Suscripciones:** Solo lectura para el dueño; creación/expiración únicamente vía RPC (`create_trial_subscription`, `mark_subscription_expired`).

---

## 5. Estándares de Diseño y UI/UX

- **Mobile-first real (`< 380px`):** Cero scroll horizontal, headers con `flex items-center justify-between gap-2 min-w-0`, nombres con `truncate min-w-0`, botones de acción con `shrink-0 whitespace-nowrap` y barras de estado con `flex-wrap` para impedir solapamientos.
- **Estética SaaS profesional (Anti-IA):**
  - Regla 60-30-10 en neutros + 1 acento funcional; cero degradados neón, cero `blur-3xl` decorativos y cero bordes gruesos o sombras excesivas (`shadow-lg`/`xl`) en tarjetas estáticas.
  - Jerarquía por aire, contraste sutil y bordes de `1px`.
  - `tabular-nums` obligatorio en precios, contadores, tablas y métricas.
  - Librería única `lucide-react` con trazo uniforme (`1.5–1.75`); **prohibido usar emojis** en la interfaz.
  - Microcopy operativo y directo; toasts cortos de 2 a 5 palabras.
  - Formularios extensos en paneles laterales (`SettingsDrawer` vía portal `document.body`) en lugar de modales centrados.
- **Lenguaje multi-rubro:** Usar siempre `getStatusCopy(status, businessType, ...)` para adaptar textos al rubro (nunca mostrar "cocina" o "platos" en tiendas `retail`, `pharmacy` o `stationery`).

---

## 6. Guía de Desarrollo, Pruebas y Despliegue

### 6.1 Variables de Entorno (`camly-app/.env.local` y Netlify)

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-publica>
VITE_SUPABASE_PRODUCT_BUCKET=product-images
```

_(Nunca exponer `service_role` keys en el frontend)._

### 6.2 Comandos Esenciales (ejecutar dentro de `camly-app/`)

```bash
npm install --legacy-peer-deps   # Instalar dependencias
npm run dev                      # Servidor local (Vite)
npm run lint                     # Verificación ESLint
npm run build                    # Build producción + PWA + SEO prerender
```

### 6.3 Pruebas y Auditoría

- **Pruebas de carga (`k6`):** Ejecutar contra endpoints públicos (`/:slug`, RPC `customer_get_order`) para validar latencia y límites de lectura en tráfico pico.
- **Auditoría RLS:** Probar siempre con dos sesiones: usuario anónimo (sin acceso a pedidos ajenos ni escrituras directas) y dueño de Negocio A intentando leer/editar Negocio B (debe devolver 0 filas / error).
- **Pruebas E2E (`Playwright`):** Cubrir registro, creación de producto, flujo completo de compra (`/:slug` → carrito → cotización → `/tracking/:orderId` → confirmación/cancelación dentro y fuera de 60s) y vista móvil `< 380px`.
- **Consultas optimizadas:** Evitar `.select('*')` en vistas públicas; seleccionar solo las columnas necesarias y limpiar siempre canales Realtime en `useEffect`.

### 6.4 Reglas de Uso de IA en el Repositorio

- Usar **`@MANUAL_NEGU.md`** como contexto único inicial antes de tocar código; no escanear carpetas completas ni leer archivos fuera del alcance de la tarea.
- Mantener **`.claudeignore` / `.claudesignore`** actualizado (excluyendo `node_modules/`, `dist/`, lockfiles y assets pesados) para minimizar consumo de tokens.
- Antes de cerrar cualquier cambio: validar con `npm run lint` y `npm run build`.

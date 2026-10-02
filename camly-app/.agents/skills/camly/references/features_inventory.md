# Inventario Exhaustivo de Funcionalidades de Camly

Este documento categoriza de manera estricta el estado del software actual para cumplir la **Regla de No Invención**: distinguir siempre con rigor entre lo existente, lo parcialmente implementado y lo pendiente.

---

## 1. Módulos y Funcionalidades Implementadas (Completas)

### 1.1. Catálogo Público Multi-tenant (`/:slug` - `StorePage.jsx`)
* [x] Carga dinámica del negocio mediante parámetro slug en URL.
* [x] Inyección dinámica de colores de marca (`--primary-brand`) según configuración del negocio.
* [x] Navegación por categorías con scroll horizontal y filtro reactivo.
* [x] Tarjetas de producto (`ProductCard.jsx`) con imagen, nombre, descripción, precio en COP y selector de cantidades.
* [x] Modal de personalización de notas por producto ("sin cebolla", "bien cocido").
* [x] Aislamiento del carrito por `businessId` con persistencia en `localStorage`.

### 1.2. Checkout y Flujo de Pedido (`OrderDrawer.jsx`)
* [x] Drawer lateral animado de carrito de compras.
* [x] Modalidades de entrega: **Domicilio** y **Recoger en tienda**.
* [x] Integración de mapa interactivo (`LocationPickerMap.jsx` con Leaflet y OpenStreetMap) para marcar pin GPS de entrega.
* [x] Autocompletado de coordenadas mediante botón "Usar mi ubicación actual" (HTML5 Geolocation).
* [x] Cálculo automático de distancia en kilómetros desde las coordenadas del negocio al cliente mediante fórmula de Haversine.
* [x] Cálculo dinámico de flete: tarifa por km con validación de costo mínimo (`domicilio_minimo`).
* [x] Métodos de pago configurables: Efectivo (con solicitud de cambio o "con cuánto pagas") y Transferencia bancaria (Nequi, Daviplata, Bancolombia).
* [x] Registro del pedido en la base de datos de Supabase (`pedidos`) con generación de token único de seguimiento.
* [x] Generación y redirección automática hacia el WhatsApp del negocio con mensaje estructurado y enlace directo de Google Maps con la ubicación GPS del cliente.

### 1.3. Panel de Administración (`/admin` - `AdminPage.jsx`)
* [x] Protección de rutas con `AuthGuard` y sesión en Supabase Auth.
* [x] **Dashboard:** Resumen de métricas clave (ventas del día, pedidos activos, ticket promedio).
* [x] **Gestión de Pedidos (`OrdersView.jsx`):** Listado y kanban de pedidos en tiempo real con actualización de estados (`nuevo` -> `preparando` -> `en camino` -> `entregado` -> `cancelado`), asignación de domiciliarios y botón de contacto directo con el cliente por WhatsApp.
* [x] **Gestión de Productos (`ProductsView.jsx`):** Creación, edición, eliminación y cambio de disponibilidad (stock). Carga de imágenes directamente a Supabase Storage (`product-images`).
* [x] **Gestión de Categorías (`CategoriesView.jsx`):** CRUD completo de categorías del catálogo.
* [x] **Gestión de Domiciliarios (`DriversView.jsx`):** CRUD de repartidores con nombre, teléfono y switch activo/inactivo.
* [x] **Reporte de Ingresos (`RevenueView.jsx`):** Gráficos estadísticos con Recharts (ventas por día, distribución por método de pago y volumen de pedidos).
* [x] **Configuración del Negocio (`SettingsView.jsx`):** Personalización del slug, nombre visible, WhatsApp, dirección, tarifas de domicilio (por km, mínimo, fija), coordenadas en mapa y datos bancarios.

### 1.4. Autenticación y Onboarding (`/login`, `/registro`, `/bienvenido`)
* [x] Registro de nuevos negocios con Supabase Auth.
* [x] Creación automática del registro en la tabla `negocios` y suscripción trial de 14 días en `suscripciones`.
* [x] Pantalla de bienvenida con checklist de configuración inicial.

---

## 2. Funcionalidades Parcialmente Implementadas

### 2.1. Seguimiento de Pedidos para el Cliente (`/tracking` - `TrackingPage.jsx`)
* **Estado:** Parcialmente implementado.
* **Lo que existe:** La vista consulta el pedido mediante el parámetro `?t=:token` y muestra el estado básico (Nuevo, En preparación, En camino, Entregado).
* **Lo que falta:**
  * Sincronización Realtime por websocket en esta vista para que el cliente no tenga que refrescar manualmente para ver cambios de estado.
  * Mapa en vivo con la ubicación del repartidor si estuviera en tránsito.

### 2.2. Control de Suscripciones SaaS y Pasarela de Pago
* **Estado:** Parcialmente implementado.
* **Lo que existe:** La tabla `suscripciones` registra `plan`, `estado`, `fecha_fin` y días restantes de prueba. Existe la pantalla `PlanExpiredView` y el modal `BillingModal` que bloquea funciones Pro cuando expira el trial.
* **Lo que falta:**
  * Integración con una pasarela de pagos real (Wompi, Mercado Pago, ePayco o Stripe) para cobro automatizado recurrente con tarjeta o PSE.
  * Webhook de confirmación de pago para renovar automáticamente la columna `fecha_fin` en Supabase. Actualmente la activación requiere intervención manual del administrador.

### 2.3. Políticas de Seguridad (RLS)
* **Estado:** Parcialmente implementado.
* **Lo que existe:** Las tablas tienen `ENABLE ROW LEVEL SECURITY`.
* **Lo que falta:** Las directivas actuales tienen `USING (true) WITH CHECK (true)`. Falta aplicar las reglas estrictas de `auth.uid() = user_id` para aislar formalmente el panel administrativo de cada negocio en producción.

---

## 3. Funcionalidades Pendientes / Roadmap Futuro

1. **Variantes y Modificadores de Producto:** Posibilidad de crear productos con tallas, términos de carne, o adicionales con costo extra (ej. "Tocineta extra +$3.000").
2. **Impresión Térmica de Comandas:** Botón directo en `OrdersView` para imprimir la comanda de cocina en impresoras térmicas ESC/POS (58mm / 80mm) vía Bluetooth o USB.
3. **Notificaciones Push / Alerta Sonora de Nuevo Pedido:** Reproducción de un sonido de campana o timbre cuando entra un nuevo pedido en tiempo real al panel administrativo.
4. **Exportación de Datos:** Descarga de reportes de ventas y clientes en formato Excel/CSV para contabilidad.
5. **Horarios de Atención Automáticos:** Configurar días y horas de apertura para desactivar automáticamente la recepción de pedidos fuera de horario laboral.
6. **Múltiples Sedes / Sucursales:** Gestión de varias sedes físicas bajo una misma marca con enrutamiento de pedidos a la sede más cercana al cliente.

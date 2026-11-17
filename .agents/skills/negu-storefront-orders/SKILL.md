---
name: negu-storefront-orders
description: >-
  Runbook operativo del catálogo público, carrito multi-tenant, checkout por WhatsApp y seguimiento en vivo de pedidos en NEGU.
  Activa esta skill al modificar la experiencia del cliente final: StorePage, ProductCard, OrderDrawer, LocationPickerMap, TrackingPage, OrderService, status-labels o useCartStore.
---

# NEGU — Storefront, Checkout & Tracking

Usa esta skill junto con `camly` cada vez que trabajes en el flujo de compra del cliente final (`/:slug` y `/tracking`).

## 1. Mapa de archivos clave

| Responsabilidad | Archivo |
| :--- | :--- |
| Catálogo público por slug, modo mesa (`?mesa=`) y franja info tienda | [StorePage.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/store/StorePage.jsx) |
| Tarjeta de producto y modal de toppings/opciones | [ProductCard.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/store/ProductCard.jsx) |
| Drawer de carrito, domicilio/recogida/mesa, efectivo/transferencia y envío a WhatsApp | [OrderDrawer.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/store/OrderDrawer.jsx) |
| Selector de pin en mapa Leaflet | [LocationPickerMap.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/store/components/LocationPickerMap.jsx) |
| Pie de catálogo y horarios visibles | [StoreFooter.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/store/components/StoreFooter.jsx) |
| Rastreo en vivo por `id` + `token`, ventana de gracia 60s y carga de comprobante | [TrackingPage.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/store/TrackingPage.jsx) |
| RPCs del cliente en seguimiento y Storage `receipts` | [orderService.ts](file:///c:/Users/josue/Documents/dogcity/camly-app/src/services/orderService.ts) |
| Copys y stepper por tipo de negocio y modalidad | [status-labels.ts](file:///c:/Users/josue/Documents/dogcity/camly-app/src/lib/status-labels.ts) |
| Carrito multi-tenant aislado por `businessId` | [stores/index.js](file:///c:/Users/josue/Documents/dogcity/camly-app/src/stores/index.js) |
| Formato de mensaje WhatsApp, horarios y moneda COP | [utils.js](file:///c:/Users/josue/Documents/dogcity/camly-app/src/lib/utils.js) |

## 2. Contratos críticos que NO deben romperse

### Modalidades de entrega y cálculo de envío (`OrderDrawer.jsx`)
- **Modos (`deliveryMethod`)**: `'envio'` (domicilio), `'recogida'` (retiro en local, envío `$0`) y `'mesa'` (cuando existe `tableNumber` vía `?mesa=` en URL o `sessionStorage`).
- **Tipos de domicilio (`business.tipo_domicilio`)**:
  - `'fijo'`: aplica `Number(business?.precio_domicilio ?? 0)` (incluido `$0` = envío gratis) inmediatamente sin exigir GPS; permite pedir con dirección escrita o mapa.
  - `'automatico'` (`per_km`): calcula distancia Haversine entre `(business.lat, business.lng)` y la ubicación elegida (GPS o botón `"Ubicar en mapa"`), con piso `domicilio_minimo ?? 3000` y tarifa `costo_por_km ?? 1200`. Exige coordenada antes de enviar.
  - `'manual'` (`custom_quote`): el pedido nace con estado `COTIZACION_PENDIENTE` (`delivery_fee = 0`) para que el comercio cotice el domicilio desde `OrdersView`.

### Idempotencia y concurrencia en checkout
- `OrderDrawer.jsx` protege el envío con:
  1. `submittingRef` para evitar doble clic antes del re-render.
  2. `pendingOrderRef` con firma del carrito (`orderSignature`) para reutilizar el mismo `token` UUID si el usuario reintenta el mismo pedido tras un error de red.
- Usa siempre `??` (no `||`) al leer tarifas numéricas (`precio_domicilio`, `domicilio_minimo`, `costo_por_km`) para no romper envíos gratis (`0`).

### Opciones y toppings (`ProductCard.jsx` & `useCartStore`)
- `useCartStore.addItem` agrupa ítems únicamente si coinciden `productId`, opciones seleccionadas y `note`.
- Si el producto tiene `product.opciones.length > 0`, abrir el modal antes de agregar al carrito. Mostrar prefijo `Desde` cuando un grupo obligatorio tiene opciones pagas.

### Rastreo y ventana de gracia (`TrackingPage.jsx`)
- Consulta real siempre mediante `customer_get_order(p_order_id, p_token)`; si faltan `id` o `token` (y no es `?store=demo`), mostrar error en lugar de caer en datos ficticios.
- Ventana de gracia de `60s` (`CONFIRMADO_GRACIA`): validada en backend por trigger `guard_customer_order_cancellation` y RPCs `customer_cancel_order` / `advance_grace_to_preparation`.

## 3. Verificación al modificar esta área

1. Probar flujo móvil (360–430 px) y escritorio.
2. Verificar los 3 casos de envío: `fijo` (incluyendo `$0`), `automatico` (GPS y pin manual) y `recogida`.
3. Ejecutar `npm --prefix c:\Users\josue\Documents\dogcity\camly-app run build` y `eslint.cmd` sobre los archivos tocados.

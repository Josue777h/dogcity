---
name: negu-admin-pos
description: >-
  Runbook operativo del panel de administración de comercios y POS (Comandero) de NEGU.
  Activa esta skill al editar AdminPage, Sidebar, AdminHeader, DashboardView, ComanderoView, OrdersView, ProductsView, CategoriesView, DriversView, RevenueView, SettingsView, ProductModal, ToppingsManagerModal o bluetoothPrinter.
---

# NEGU — Admin Panel & Comandero POS

Usa esta skill junto con `camly` cuando trabajes dentro de `/admin/*` (gestión del comercio y operación diaria en restaurante).

## 1. Mapa de archivos clave

| Módulo / Vista | Archivo |
| :--- | :--- |
| Contenedor autenticado, polling (10s), Realtime y `BroadcastChannel` | [AdminPage.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/AdminPage.jsx) |
| Navegación lateral filtrada por `isModuleEnabled()` | [Sidebar.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/components/Sidebar.jsx) |
| Barra superior (título sección, copiar link, ver tienda, estado plan) | [AdminHeader.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/components/AdminHeader.jsx) |
| KPIs del día, gráfica semanal y accesos rápidos | [DashboardView.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/views/DashboardView.jsx) |
| POS de mesas, notas rápidas de cocina y Modo Mesero con PIN | [ComanderoView.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/views/ComanderoView.jsx) |
| Gestión en vivo de pedidos, cotización, repartidores e impresión | [OrdersView.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/views/OrdersView.jsx) |
| Catálogo admin (cuadrícula/lista, pausa rápida) | [ProductsView.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/views/ProductsView.jsx) |
| Modal crear/editar producto con auto-borrador | [ProductModal.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/components/ProductModal.jsx) |
| Constructor de grupos de opciones/toppings y biblioteca | [ToppingsManagerModal.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/components/ToppingsManagerModal.jsx) |
| Categorías relacionales | [CategoriesView.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/views/CategoriesView.jsx) |
| Equipo de domiciliarios | [DriversView.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/views/DriversView.jsx) |
| Reportes, filtros de retención y exportación CSV | [RevenueView.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/views/RevenueView.jsx) |
| Perfil, diseño, tarifas de envío, horarios y QR de mesas | [SettingsView.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/views/SettingsView.jsx) |
| Impresora térmica ESC/POS vía Web Bluetooth | [bluetoothPrinter.js](file:///c:/Users/josue/Documents/dogcity/camly-app/src/lib/bluetoothPrinter.js) |

## 2. Reglas de operación y detalles clave

### Foco actual en gastronomía
- Mientras NEGU opere en fase restaurantes, no introducir plantillas de retail/ropa dentro de `ToppingsManagerModal`, `CategoriesView` ni vistas del admin.

### Serialización de opciones/toppings (`ProductModal` & `ToppingsManagerModal`)
- `buildRecord` en [supabase.js](file:///c:/Users/josue/Documents/dogcity/camly-app/src/lib/supabase.js) guarda las opciones del producto como `<!--NEGU_OPTIONS:[...]-->` dentro de `descripcion` cuando no existe columna JSON dedicada.
- Montar `ToppingsManagerModal` de forma condicional (`{isToppingsModalOpen && ...}`) para garantizar que inicialice con los grupos actuales del producto y no conserve borradores viejos.
- En `AdminPage.handleSaveProduct`, propagar (`throw err`) en caso de fallo para que `ProductModal` no se cierre ni borre el draft local del usuario.

### Sincronización y edición sin sobrescritura (`SettingsView` & `AdminPage`)
- `AdminPage` ejecuta `loadData(..., false)` cada `10s` y al recuperar foco.
- `SettingsView` protege los cambios no guardados mediante `hasUnsavedChangesRef` y `syncedBusinessIdRef` para que el polling no pise lo que el dueño está escribiendo. Respetar ese patrón al agregar campos en `SettingsView`.

### Layout y reglas visuales en Tailwind v4
- **Evitar `space-y-*` cuando un hijo tiene `!mb-0` o márgenes anulados** (causó que los botones del header en `DashboardView` quedaran pegados a las KPI cards): usar `flex flex-col gap-*` o `grid gap-*`.
- **Consistencia de color y sobriedad**: usar tokens `slate-900`/`slate-950`, `emerald-600`, `amber-*` o `--color-brand`; evitar azules arbitrarios mezclados o botones redundantes entre la cabecera de tarjeta y su cuerpo expandido (`OrdersView`).
- **Impresión térmica**: conservar ambos caminos: `printThermalReceipt` (HTML/window.print) y `printOrderViaBluetooth` (`Web Bluetooth ESC/POS`).

## 3. Verificación al modificar esta área

1. Revisar comportamiento en móvil (< 640px) y escritorio (`lg+`, donde el layout usa `lg:h-dvh lg:overflow-hidden`).
2. Ejecutar `npm --prefix c:\Users\josue\Documents\dogcity\camly-app run build` y `eslint.cmd` sobre cada archivo editado.

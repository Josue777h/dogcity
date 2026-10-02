# Arquitectura del Sistema Camly

Este documento detalla la estructura tecnológica, principios de diseño de software y patrones arquitectónicos aplicados en Camly.

---

## 1. Stack Tecnológico Base

* **Frontend Framework:** React 19 (`19.2.4`) con Vite (`8.0.4`).
* **Enrutamiento:** `react-router-dom` v7 (`7.14.1`) con Code Splitting / Lazy Loading (`React.lazy` y `Suspense`).
* **Estilizado & CSS:** Tailwind CSS v4 (`@tailwindcss/vite` `4.2.2`) junto a variables CSS nativas (`--primary-brand`, `--bg-primary`, etc.) para permitir tematización dinámica por negocio.
* **Gestión de Estado Global:** Zustand (`5.0.12`) con persistencia local (`persist` middleware) para el carrito del comprador.
* **Geolocalización & Mapas:** Leaflet (`1.9.4`) y `react-leaflet` (`5.0.0`) con cálculo de distancias por fórmula de Haversine.
* **Backend as a Service (BaaS):** Supabase (`@supabase/supabase-js` `2.103.3`) para base de datos relacional PostgreSQL, autenticación, storage de imágenes y suscripciones en tiempo real (Realtime).
* **Métricas & Gráficos:** Recharts (`3.8.1`) para visualización de ingresos y pedidos en el panel de control.
* **Iconografía:** `lucide-react` (`0.468.0`).
* **PWA:** `vite-plugin-pwa` (`1.2.0`) para instalación en móviles y accesibilidad como aplicación de pedidos.

---

## 2. Estructura de Directorios

El proyecto organiza su código dentro de `camly-app/src` utilizando un enfoque de **Feature-Driven Architecture** (Arquitectura orientada a características/módulos):

```text
camly-app/
├── public/                 # Favicons, manifests e imágenes estáticas
├── supabase/               # DDL y scripts SQL
│   ├── schema.sql          # Esquema completo de tablas, índices, triggers y RLS
│   └── README.md           # Guía de despliegue en Supabase
├── src/
│   ├── components/         # Componentes transversales compartidos
│   │   └── ui/             # Modales (ConfirmModal, BillingModal), ToastContainer, etc.
│   ├── features/           # Módulos de dominio principales
│   │   ├── admin/          # Panel de administración para el dueño del negocio
│   │   │   ├── components/ # Header, navegación lateral, selectores
│   │   │   └── views/      # Dashboard, Orders, Products, Categories, Drivers, Revenue, Settings
│   │   ├── auth/           # Login, Registro, AuthGuard para rutas protegidas
│   │   ├── marketing/      # Landing page pública corporativa, WelcomePage (onboarding)
│   │   └── store/          # Experiencia de compra para clientes finales
│   │       ├── components/ # Mapa de geolocalización, StoreFooter, etc.
│   │       ├── OrderDrawer.jsx   # Drawer lateral de carrito, checkout y cálculo GPS
│   │       ├── ProductCard.jsx   # Tarjeta de producto con modales de opciones
│   │       ├── StorePage.jsx     # Catálogo público del negocio por slug (/:slug)
│   │       └── TrackingPage.jsx  # Seguimiento de pedido por token (/tracking)
│   ├── hooks/              # Custom hooks reutilizables (geolocalización, media queries)
│   ├── lib/                # Utilidades, cliente de Supabase y constantes
│   │   ├── constants.js    # Enums, métodos de pago, estados de pedido
│   │   ├── supabase.js     # Cliente inicializado de Supabase y helpers de datos
│   │   └── utils.js        # Formateo de moneda (COP), fechas y cálculos
│   ├── stores/             # Stores globales Zustand
│   │   └── index.js        # useCartStore, useBusinessStore, useAuthStore, useToastStore
│   ├── App.jsx             # Router principal con rutas públicas, dinámicas y protegidas
│   ├── index.css           # Directivas Tailwind, fuentes y variables de color
│   └── main.jsx            # Entry point de React en el DOM
```

---

## 3. Modelo Multi-Inquilino (Multi-Tenancy)

Camly opera como un sistema multi-tenant donde cada comercio registrado opera en su propio espacio virtual:

1. **Resolución por Slug (`/:slug`):**
   * Cuando un cliente ingresa a `camly.co/pizzaliberty`, `StorePage.jsx` extrae el slug `pizzaliberty` desde los parámetros de URL.
   * Se ejecuta una consulta a `negocios` filtrando por `nombre = :slug`.
   * Se cargan en memoria los datos del negocio (colores corporativos, logo, WhatsApp, configuración de domicilios, métodos de pago aceptados).
   * Se actualiza la variable CSS `--primary-brand` para teñir toda la interfaz con la identidad del comercio.
2. **Aislamiento del Carrito (`useCartStore`):**
   * El store del carrito almacena los items con clave por `businessId`:
     ```javascript
     carts: {
       [negocioIdA]: { quantities: { prod1: 2 }, notes: {}, comment: '' },
       [negocioIdB]: { quantities: { prod5: 1 }, notes: {}, comment: '' }
     }
     ```
   * Esto previene que los carritos de distintos comercios se mezclen en el almacenamiento local del navegador del cliente.
3. **Aislamiento en Base de Datos:**
   * Todas las entidades secundarias (`categorias`, `productos`, `pedidos`, `domiciliarios`, `suscripciones`) cuentan con una clave foránea `negocio_id REFERENCES negocios(id) ON DELETE CASCADE`.

---

## 4. Estado Global (Zustand Stores)

En `src/stores/index.js` se definen 4 stores esenciales:

* **`useCartStore`:** Persistido en `localStorage`. Controla cantidades por producto, notas personalizadas por ítem, método de entrega seleccionado (`envio` vs `recoger`), datos del cliente (nombre, teléfono, dirección, coordenadas GPS, costo de domicilio calculado) y método de pago.
* **`useBusinessStore`:** Mantiene la información del negocio activo en sesión o en visita de cliente, categorías, catálogo de productos, suscripción SaaS activa (`plan`, `estado`, `trialDaysLeft`, `isPro`, `isExpired`).
* **`useAuthStore`:** Almacena la sesión de Supabase Auth (`user`, `access_token`).
* **`useToastStore`:** Notificaciones visuales flotantes automáticas con temporizador de auto-cierre a los 3.5 segundos.

---

## 5. Estrategia de Carga y Optimización (Code Splitting)

En `App.jsx`, todas las rutas principales utilizan `lazy()` y `Suspense`:
* `LandingPage`, `LoginPage`, `RegisterPage`, `WelcomePage`, `AdminPage`, `StorePage` y `TrackingPage` se dividen en chunks independientes.
* Un usuario que entra únicamente a pedir una hamburguesa en `/:slug` no descarga el código de Recharts del dashboard de administración ni las vistas de analítica, garantizando una carga rápida en redes móviles 3G/4G.

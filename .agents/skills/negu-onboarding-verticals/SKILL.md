---
name: negu-onboarding-verticals
description: >-
  Guía de arquitectura para el registro de negocios, onboarding inicial y activación modular de verticales (restaurantes vs retail, perfumería, ropa, etc.) en NEGU.
  Activa esta skill al trabajar en RegisterPage, EmailVerificationPage, AuthCallbackPage, WelcomePage, createBusinessForUser, modules.ts o el futuro cuestionario de tipo de negocio.
---

# NEGU — Onboarding & Multi-Vertical Architecture

Usa esta skill junto con `camly` al trabajar en registro de comercios, primer ingreso y separación de capacidades por rubro.

## 1. Mapa de archivos clave

| Responsabilidad | Archivo |
| :--- | :--- |
| Registro en 2 pasos (datos del negocio + credenciales y legales) | [RegisterPage.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/auth/RegisterPage.jsx) |
| Creación de usuario + slug + registro en `negocios` y trial 7 días | [supabase.js (`registerBusiness`, `createBusinessForUser`)](file:///c:/Users/josue/Documents/dogcity/camly-app/src/lib/supabase.js#L496-L596) |
| Callback OAuth / confirmación de correo | [AuthCallbackPage.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/auth/AuthCallbackPage.jsx) |
| Pantalla de bienvenida tras crear tienda (`/bienvenido`) | [WelcomePage.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/marketing/WelcomePage.jsx) |
| Arquitectura de capacidades (`ModuleKey`, `getEnabledModules`, `isModuleEnabled`) | [modules.ts](file:///c:/Users/josue/Documents/dogcity/camly-app/src/lib/modules.ts) |
| Textos de estado y stepper adaptados por `business_type` | [status-labels.ts](file:///c:/Users/josue/Documents/dogcity/camly-app/src/lib/status-labels.ts) |
| Filtro de pestañas en menú lateral admin | [Sidebar.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/features/admin/components/Sidebar.jsx) |
| Rutas `/registro`, `/verificar-correo`, `/auth/callback`, `/bienvenido` | [App.jsx](file:///c:/Users/josue/Documents/dogcity/camly-app/src/App.jsx) |

## 2. Estado actual confirmado vs diseño objetivo

### Lo que existe hoy
1. `RegisterPage.jsx` recoge: `ownerName`, `businessName`, `storeSlug`, `phone` (actualmente restringido a móvil Colombia `+57` con regex `^3\d{9}$`), `email`, `password` y aceptación de términos/privacidad.
2. `createBusinessForUser` inserta en `negocios` sin enviar `business_type`, por lo que PostgreSQL asigna `DEFAULT 'general'`, y llama `create_trial_subscription` (7 días Pro).
3. `src/lib/modules.ts` define `ModuleKey` (`catalog`, `orders`, `kitchen`, `delivery`, `loyalty`, `appointments`, `inventory`), pero actualmente `getEnabledModules()` siempre retorna `FOOD_TEMPLATE_MODULES` y `Sidebar.jsx` asocia tanto **Comandero** como **Pedidos en vivo** al módulo `'orders'` en lugar de exigir `'kitchen'` para Comandero.

### Reglas para evolucionar el onboarding tipo Shopify
1. **Fase actual**: NEGU sale primero optimizado para **gastronomía / restaurantes**. Todo negocio gastronómico debe quedar guardado explícitamente con `business_type = 'food'`.
2. **Separación por capacidades (nunca `if (tipo === 'ropa')` regados por toda la UI)**:
   - Asociar **Comandero de Mesas** y etiquetas rápidas de cocina al módulo `'kitchen'` (no solo a `'orders'`), de modo que comercios sin salón ni cocina (ropa, perfumes, gorras, juguetes) no vean Comandero ni modos de mesa.
   - Mantener el menú **Core** (`catalog`, `orders`, `delivery`) transversal a todos los verticales.
3. **Persistencia segura entre confirmación de correo y alta del negocio**:
   - Si Supabase Auth exige confirmación por email (`!authData.session`), los datos del cuestionario (rubro, plantilla, canal de venta, experiencia) deben viajar en `options.data` (`user_metadata`) igual que `negu_business_name` y `negu_store_slug`, para que `createBusinessForUser` los aplique automáticamente al volver de `/auth/callback`.

## 3. Verificación tras cambios de onboarding

1. Probar registro con sesión inmediata y con confirmación por email pendiente (`AuthCallbackPage`).
2. Comprobar que la columna `business_type` (y módulos si aplican) persistan en `negocios` y que `Sidebar` muestre únicamente los módulos habilitados.
3. Ejecutar `npm --prefix c:\Users\josue\Documents\dogcity\camly-app run build` y `eslint.cmd`.

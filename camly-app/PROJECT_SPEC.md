# NEGU (negu.pro) - Especificación del Sistema

## 1. Visión del Producto
Plataforma SaaS multi-tenant que digitaliza y automatiza el proceso comercial de comercios locales y gastronomía (restaurantes, ropa, farmacias, papelerías) a 0% comisión por pedido.

## 2. Flujo Principal
1. Cliente entra por QR o link público (/:slug).
2. Agrega productos al carrito y selecciona envío (Fijo, Por KM o Por Cotizar).
3. Envía pedido estructurado a WhatsApp y panel.
4. Cliente monitorea estado en vivo vía /tracking/:orderId.
5. Tienda gestiona comanda en /admin e imprime ticket POS térmico.

## 3. Stack Tecnológico
- Frontend: React (Vite / SPA), React Router, TypeScript, Tailwind CSS.
- Backend & DB: Supabase (PostgreSQL, Supabase Realtime, Storage, RLS).
- Audio & Alertas: Notificaciones sonoras en panel admin ante pedidos entrantes.

## 4. Reglas Críticas de Arquitectura
- Multi-rubro (business_type en stores: 'food', 'retail', 'pharmacy', 'general'). No usar términos exclusivos de cocina en tiendas que no sean gastronómicas.
- Cero scroll horizontal o layouts rotos en móviles (mobile-first).
- Consultas Supabase optimizadas con cleanup de canales Realtime en useEffect.
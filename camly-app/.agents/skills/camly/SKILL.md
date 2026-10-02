---
name: camly
description: >-
  Manual central de trabajo y sistema operativo para el proyecto Camly (SaaS de catálogos digitales con pedidos organizados a WhatsApp y cálculo GPS para negocios gastronómicos y de retail).
  Activa esta skill siempre que el usuario mencione Camly, pida agregar o modificar componentes, pantallas, stores, endpoints de Supabase, esquemas de base de datos, flujos de pedidos, roles de desarrollo, marketing, copywriting, auditorías de seguridad, o arquitectura del producto.
---

# Camly — Manual Central de Trabajo y Sistema Operativo

Bienvenido a la **Skill Oficial de Camly**. Este documento es la guía canónica y el sistema operativo para cualquier agente o desarrollador que trabaje en el proyecto Camly dentro del entorno de Antigravity.

Camly no es un proyecto de juguete ni un simple catálogo digital: es una **plataforma SaaS multi-inquilino (Multi-tenant)** diseñada para digitalizar y simplificar las ventas de restaurantes, cafeterías, panaderías y comercios medianos/pequeños en Latinoamérica (iniciando en Colombia), resolviendo el caos de tomar pedidos por WhatsApp.

---

## 1. Misión y Filosofía de Camly

### La Propuesta de Valor Central
> **"Camly organiza el pedido antes de que llegue al WhatsApp del negocio."**

En el modelo tradicional, pedir por WhatsApp implica 10 a 15 mensajes repetitivos:
* "¿Qué sabores tienen?"
* "¿Cuánto cuesta el domicilio hasta mi barrio?"
* "¿Dónde estás ubicado?"
* "¿Cómo te pago?"

**Camly elimina ese desorden:**
1. El cliente entra al catálogo interactivo del negocio (`/:slug`).
2. Agrega sus productos con notas personalizadas.
3. Especifica su método de entrega (Domicilio con pin GPS en mapa interactivo o Recoger en tienda).
4. El sistema calcula automáticamente el costo de envío exacto por kilómetro desde las coordenadas del negocio.
5. Selecciona el método de pago configurado por el comercio.
6. Al presionar "Enviar Pedido", se genera un pedido estructurado en Supabase con token de rastreo y se abre WhatsApp con un mensaje estructurado, limpio y sin ambigüedades.
7. El negocio gestiona el estado en tiempo real en su panel de administración (`/admin`).

---

## 2. Regla Fundamental y Directrices Inviolables

```text
       ┌────────────────────────────────────────────────────────┐
       │                 REGLA FUNDAMENTAL DE CAMLY             │
       │                                                        │
       │   No implementar una solución únicamente porque        │
       │   "funciona". Una solución para Camly debe ser:        │
       │                                                        │
       │   FUNCIONAL + SEGURA + MANTENIBLE + ESCALABLE +        │
       │         FÁCIL DE USAR + COHERENTE CON EL PRODUCTO      │
       └────────────────────────────────────────────────────────┘
```

### Reglas de Oro:
1. **Regla de No Invención:** Nunca asumas que una funcionalidad existe. Si no está en el código, indícalo claramente: *"Actualmente no está implementada"*. Si existe a medias: *"Actualmente está implementada parcialmente"*. Distingue siempre entre: **existente**, **parcialmente implementado**, **propuesto** y **pendiente**.
2. **Prioridad de Decisiones:**
   1. Seguridad
   2. Integridad de datos
   3. Correctitud funcional
   4. Experiencia de usuario (UX)
   5. Mantenibilidad y limpieza
   6. Rendimiento
   7. Escalabilidad
   8. Conveniencia de implementación
3. **Multi-tenancy Sagrado:** Cada consulta a base de datos, mutación, acción en el carrito y recurso multimedia debe estar rigurosamente aislado por el `negocio_id` / `user_id`. Un negocio JAMÁS debe poder ver, alterar o borrar los datos de otro.
4. **Diseño Humano y Profesional:** Evitar interfaces genéricas, colores saturados sin armonía, y lenguaje corporativo frío o con tono de "inteligencia artificial". Camly debe sentirse como una herramienta nativa, cálida y de nivel Silicon Valley adaptada al comercio local.

---

## 3. Matriz de Roles Dinámicos

Según la naturaleza de la instrucción del usuario, adopta automáticamente la mentalidad, prioridades y herramientas del rol correspondiente:

| Rol | Cuándo se activa | Enfoque Principal | Referencia Detallada |
| :--- | :--- | :--- | :--- |
| **Product Architect** | Decisiones estructurales, nuevas funcionalidades, modelo SaaS | Visión holística, impacto en planes, aislamiento de datos, roadmap | [roles.md#product-architect](./references/roles.md#1-product-architect--saas-strategist) |
| **Fullstack Developer** | Tareas end-to-end, integración de vistas con backend | React 19, Vite, Zustand, Tailwind, Supabase JS, flujos completos | [roles.md#fullstack-developer](./references/roles.md#2-fullstack-developer) |
| **Frontend & UI/UX** | Diseño de componentes, landing page, drawers, catálogo | Micro-animaciones, Tailwind 4, feedback visual instantáneo, responsive | [roles.md#frontend--uiux](./references/roles.md#3-frontend--uiux-specialist) |
| **Backend & DB** | Tablas, esquemas SQL, RLS, triggers, Storage, Realtime | Integridad relacional, migraciones idempotentes, funciones Postgres | [roles.md#backend--database](./references/roles.md#4-backend--database-engineer) |
| **Security Engineer** | Auditorías de seguridad, autenticación, protección de endpoints | RLS estricto, sanitización de inputs, XSS, tokens de pedidos, secrets | [roles.md#security-engineer](./references/roles.md#5-security-engineer) |
| **QA & Test Engineer** | Validación de flujos, casos borde, pruebas de regresión | Geolocation fallida, montos negativos, desconexión de red, multi-tenant | [roles.md#qa--test-engineer](./references/roles.md#6-qa--test-engineer) |
| **Performance Engineer** | Tiempos de carga, optimización de queries, bundles | Lazy loading, optimización de imágenes en Supabase, índices Postgres | [roles.md#performance-engineer](./references/roles.md#7-performance-engineer) |
| **SEO Specialist** | Indexación de tiendas públicas y landing page | Metatags dinámicos por negocio, OpenGraph para WhatsApp, URLs limpias | [roles.md#seo-specialist](./references/roles.md#8-seo-specialist) |
| **Marketing & Copywriter** | Textos en landing, claims comerciales, mensajes de WhatsApp | Claridad, tono colombiano/latino natural, enfoque en dolores del dueño | [roles.md#marketing--copywriter](./references/roles.md#9-marketing-specialist--copywriter) |
| **Sales & Growth** | Conversión de prueba a pago, onboarding, planes SaaS | Reducción de fricción en registro, valor perceptible en primeros 3 min | [roles.md#sales--growth](./references/roles.md#10-sales--growth-specialist) |
| **Customer Experience** | Recorrido del comprador final y del dueño del negocio | Evitar frustración en checkout, claridad en el mapa, soporte ágil | [roles.md#customer-experience](./references/roles.md#11-customer-experience-cx) |
| **DevOps & Code Reviewer** | Despliegue en Netlify/Vercel, PRs, refactorizaciones | Variables de entorno, cero secretos en frontend, análisis estático | [roles.md#devops--code-reviewer](./references/roles.md#12-devops--code-reviewer) |

---

## 4. Mapa de Referencias Rápidas

Para profundizar en cualquier aspecto técnico del proyecto, consulta la documentación modular:

1. [**Arquitectura del Sistema** (`./references/architecture.md`)](./references/architecture.md):
   Estructura de directorios, enrutamiento en `App.jsx`, stores de Zustand (`useCartStore`, `useBusinessStore`, `useAuthStore`, `useToastStore`), convención de carpetas por feature.
2. [**Base de Datos y Supabase** (`./references/database_and_supabase.md`)](./references/database_and_supabase.md):
   Esquema SQL completo (`negocios`, `categorias`, `productos`, `domiciliarios`, `suscripciones`, `pedidos`), triggers de sincronización, políticas RLS actuales y plan de securización, Realtime y Storage.
3. [**Inventario de Funcionalidades** (`./references/features_inventory.md`)](./references/features_inventory.md):
   Matriz exhaustiva de estado (Implementado vs Parcial vs Pendiente) de Catálogo, Checkout con GPS, Panel Admin, Tracking, Auth y Planes SaaS.
4. [**Sistema de Diseño y Marca** (`./references/design_system_and_brand.md`)](./references/design_system_and_brand.md):
   Tokens de Tailwind CSS, paleta de colores adaptable por negocio, fuentes, botones, componentes modales, y guías de redacción sin clichés de IA.
5. [**Manual de Roles Detallado** (`./references/roles.md`)](./references/roles.md):
   Instrucciones procedimentales paso a paso para cada uno de los 14 perfiles profesionales.

---

## 5. Metodología de Trabajo y Ejecución

Al trabajar en Camly, aplica siempre este flujo de trabajo estandarizado:

### Para Cambios Pequeños (Bugfixes puntuales, textos, estilos cosméticos):
1. **Analizar:** Leer el archivo exacto y sus dependencias inmediatas.
2. **Implementar:** Realizar la modificación respetando el estilo existente.
3. **Verificar:** Comprobar que no haya errores de sintaxis, linter o ruptura visual.

### Para Cambios Medianos o Grandes (Nuevas vistas, campos en base de datos, flujos de compra):
1. **Analizar:** Identificar impacto en frontend, stores y base de datos.
2. **Explicar brevemente:** Plantear el problema detectado o la necesidad técnica.
3. **Proponer solución:** Describir la estrategia antes de codificar.
4. **Identificar archivos afectados:** Listar rutas exactas.
5. **Identificar cambios en BD:** Indicar si requiere DDL/migración en Supabase.
6. **Implementar:** Escribir código limpio, modular y comentado donde amerite.
7. **Verificar:** Validar estados de carga, error y éxito, así como responsiveness en móviles.
8. **Revisar regresiones:** Asegurar que los pedidos existentes y el aislamiento multi-tenant no se vean comprometidos.
9. **Resumen de entrega:** Entregar un balance claro de lo realizado y siguientes pasos recomendados.

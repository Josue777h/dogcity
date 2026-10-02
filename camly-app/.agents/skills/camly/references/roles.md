# Manual de Roles Especializados de Camly

Este documento define la mentalidad, listas de verificación y directrices procedimentales para cada uno de los roles que el agente de Antigravity adopta al trabajar en Camly.

---

## 1. Product Architect / SaaS Strategist

### Misión:
Garantizar la coherencia a largo plazo de Camly como producto SaaS escalable y rentable para pequeños y medianos negocios.

### Reglas de Decisión:
* **No inflar el producto:** No agregar funciones solo porque otras plataformas las tienen. Priorizar los diferenciadores de Camly: pedidos ordenados a WhatsApp, cálculo GPS transparente y facilidad extrema para el dueño del local.
* **Modelo Freemium / Trial a Pro:** Toda nueva característica avanzada (analíticas avanzadas, personalización profunda de marca, múltiples domiciliarios) debe considerarse en la matriz de límites de planes (`suscripciones.plan`).
* **Multi-tenant first:** Cualquier decisión de diseño debe responder a: *"¿Cómo se comporta esto con 1,000 negocios simultáneos con configuraciones y catálogos distintos?"*.

---

## 2. Fullstack Developer

### Misión:
Implementar flujos completos de inicio a fin conectando interfaces React reactivas con Supabase sin fisuras.

### Principios:
* Código declarativo, componentes funcionales limpios con hooks claros.
* Mantener la sincronía entre el estado local de Zustand y las tablas de Supabase.
* Manejo estricto de estados de carga (`isLoading`), vacíos (`EmptyStates`) y errores (`error`).
* Manejo de fechas en formato ISO y moneda formateada con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })`.

---

## 3. Frontend & UI/UX Specialist

### Misión:
Construir una experiencia visual cálida, humana, moderna y fluida que genere confianza inmediata tanto en el cliente que compra comida como en el dueño del negocio que gestiona pedidos.

### Principios de Diseño:
* **Adiós a la estética genérica de IA:** No abusar de sombras violetas fosforescentes, fondos negros absolutos sin contraste o animaciones caóticas. Usar paletas elegantes, cálidas (tonos naranja, terracota, ámbar, grises suaves y blancos limpios).
* **Diseño Mobile-First Obligatorio:** El 90% de los clientes pedirán desde su teléfono en WhatsApp. El `OrderDrawer`, el mapa Leaflet y las tarjetas de productos deben estar 100% optimizados para pantallas táctiles de 360px a 430px.
* **Feedback Inmediato:** Cada botón debe tener estados `:hover`, `:active`, `:disabled` y animaciones sutiles de transición (`transition-all duration-200`).
* **Tipografía Profesional:** Usar fuentes legibles, jerarquía clara (`h1`, `h2`, `p`), espaciados consistentes y eliminar bloques densos de texto innecesario.

---

## 4. Backend & Database Engineer

### Misión:
Proteger la integridad relacional de PostgreSQL, optimizar tiempos de respuesta y diseñar migraciones limpias y reproducibles.

### Reglas de Base de Datos:
* Toda nueva tabla debe incluir `id`, `created_at` y, cuando aplique, `negocio_id` con `ON DELETE CASCADE`.
* Toda clave foránea o columna consultada frecuentemente en `WHERE` o `ORDER BY` debe tener su índice correspondiente.
* Las migraciones deben ser idempotentes (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING / UPDATE`).
* Prevenir mutaciones destructivas accidentales: siempre escribir bloques de transacción `BEGIN ... COMMIT` o funciones en PL/pgSQL cuando se toquen múltiples registros críticos.

---

## 5. Security Engineer

### Misión:
Auditar y blindar el sistema contra vulnerabilidades comunes y proteger la privacidad de cada negocio.

### Checklist de Seguridad:
1. **RLS (Row Level Security):** Nunca dejar tablas expuestas con `USING (true) WITH CHECK (true)` en producción.
2. **Validación en Servidor / BD:** No confiar ciegamente en el `total` o `precio` enviado por el navegador. En el flujo final, validar que las cantidades y productos correspondan a los precios vigentes.
3. **Protección de Datos Personales (Habeas Data):** Teléfonos y direcciones de clientes almacenados en `pedidos` solo deben ser visibles para el negocio que recibió el pedido.
4. **Secrets y Variables de Entorno:**
   * La clave `VITE_SUPABASE_ANON_KEY` es pública en el frontend por diseño de Supabase. Por tanto, la seguridad depende estrictamente de las políticas **RLS**.
   * La clave de servicio (`service_role`) JAMÁS debe colocarse en código frontend ni en repositorios.
5. **Sanitización de Inputs:** Prevenir inyecciones XSS en nombres de productos, notas de pedidos o enlaces de WhatsApp.

---

## 6. QA & Test Engineer

### Misión:
Descubrir fallas antes de que afecten a un usuario real en un pedido en vivo.

### Escenarios de Prueba Esenciales:
* **Escenario GPS:** ¿Qué sucede si el usuario niega los permisos de geolocalización en su navegador móvil? Debe poder colocar el pin manualmente en el mapa o ingresar su dirección escrita sin bloquear el pedido.
* **Escenario Carrito Vacío o Cantidad Cero:** Evitar enviar pedidos con total $0 o sin productos seleccionados.
* **Escenario Conexión Intermitente:** ¿Cómo responde la app si el usuario pierde internet justo al enviar el pedido? Debe haber reintento y mensaje claro.
* **Multi-negocio Cruzado:** Abrir dos pestañas con dos tiendas diferentes (`/tienda-a` y `/tienda-b`) y verificar que los carritos no se mezclen.

---

## 7. Performance Engineer

### Misión:
Hacer que Camly cargue de forma instantánea incluso en teléfonos de gama media y con planes de datos móviles limitados.

### Estrategia:
* **Optimización de Imágenes:** Cargar imágenes redimensionadas desde Supabase Storage; no cargar archivos de 5MB directamente en tarjetas de producto.
* **Bundle Size:** No importar bibliotecas completas cuando solo se usa una función. Aprovechar los módulos de `lucide-react`.
* **Rerenders en React:** Usar `useMemo` y `useCallback` en componentes pesados del catálogo y del mapa interactivo.

---

## 8. SEO Specialist

### Misión:
Permitir que las tiendas públicas (`/:slug`) y la página corporativa de Camly se posicionen y se vean impecables al compartirse en WhatsApp, Facebook e Instagram.

### Requisitos:
* **Open Graph Dinámico:** Al compartir `camly.co/pizzaliberty` en un chat de WhatsApp, debe aparecer el logo del negocio, su nombre comercial y su descripción ("Pide tus pizzas favoritas a domicilio sin complicaciones").
* **Estructura Semántica:** Uso correcto de `<h1>` único por página, etiquetas `<meta name="description">` y enlaces semánticos accesibles.

---

## 9. Marketing Specialist & Copywriter

### Misión:
Comunicar con contundencia, calidez y persuasión el valor de Camly a los dueños de negocios gastronómicos y comerciales.

### Concepto Nuclear:
> **"Menos preguntas. Más pedidos organizados. Tu WhatsApp recibe pedidos listos, no conversaciones interminables."**

### Tono y Estilo:
* **Cercano, natural y colombiano/latino:** Usar términos cotidianos y comprensibles (domicilio, flete, carta digital, pedido por WhatsApp, propina, sede).
* **Evitar clichés de Inteligencia Artificial:** Prohibido usar frases como *"Revoluciona tu negocio con la tecnología del futuro"*, *"Solución integral definitiva"*, *"Ecosistema sinérgico"*.
* **Enfocarse en dolores reales:**
  * *"¿Cansado de perder tiempo escribiendo precios y calculando el domicilio a mano en cada mensaje de WhatsApp?"*
  * *"Tus clientes eligen en tu menú, marcan su ubicación en el mapa y te llega el pedido completo y listo para preparar."*

---

## 10. Sales & Growth Specialist

### Misión:
Facilitar que un comerciante pruebe Camly en menos de 3 minutos y decida adquirir un plan de pago sin fricciones.

### Pilares:
* **Onboarding Rápido (`/registro` y `/bienvenido`):** No pedir 20 campos al registrarse. Nombre del negocio, WhatsApp y contraseña son suficientes para tener un menú demo listo.
* **Activación de Valor (Time-to-Value):** Que el dueño pueda ver su propio menú funcional en su celular en sus primeros 5 minutos.
* **Retención de Suscripción:** Recordatorios amigables antes de que venza el periodo de prueba (`trialDaysLeft`), mostrando cuántos pedidos ha recibido y el tiempo que ha ahorrado.

---

## 11. Customer Experience (CX)

### Misión:
Cuidar la experiencia emocional y práctica de los dos actores de Camly:
1. **El Comprador:** Quiere pedir rápido, saber cuánto le va a costar el domicilio antes de pedir y no tener que explicarle al domiciliario dónde queda su casa tres veces.
2. **El Restaurantero / Comerciante:** Está ocupado en la cocina o atendiendo mesas; necesita que el pedido llegue claro, con el dinero calculado y el enlace de mapa listo para reenviar a su repartidor.

---

## 12. DevOps & Code Reviewer

### Misión:
Asegurar despliegues confiables (Netlify/Vercel) y mantener la más alta calidad de ingeniería en cada commit.

### Criterios de Revisión de Código:
1. ¿El código es legible y auto-explicativo?
2. ¿Respeta la arquitectura modular por features?
3. ¿Introduce variables hardcodeadas o secretos?
4. ¿Tiene manejo de errores para casos de falla de red?
5. ¿Cumple con las directrices de diseño y estilo visual de Camly?

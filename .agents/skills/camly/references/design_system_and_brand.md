# Sistema de Diseño, Identidad y Guía de Redacción de Camly

Este documento establece las pautas visuales, de interfaz de usuario y el estilo editorial para mantener coherencia en todo el ecosistema de Camly.

---

## 1. Identidad Visual y Filosofía de Diseño

Camly debe transmitir:
* **Calidez y Apetito:** Ideal para gastronomía y comercios de barrio modernos.
* **Simplicidad Absoluta:** Diseñado para que una persona sin conocimientos tecnológicos pueda comprar o atender pedidos en segundos.
* **Profesionalismo Humano:** Huir deliberadamente de la estética artificial generada por IA (evitar degradados psicodélicos, botones con brillo exagerado y fondos negros sin propósito).

---

## 2. Paleta de Colores y Tokens

### 2.1. Dinamismo por Negocio
El color principal no es rígido; cada negocio define su propio acento en `negocios.theme_color`, el cual se inyecta en la raíz del documento:
```css
:root {
  --primary-brand: #EA580C; /* Naranja/Ámbar apetitoso por defecto */
}
```

### 2.2. Paleta de la Plataforma (Camly SaaS)
* **Primario de Marca (Brand):** `#EA580C` (Naranja enérgico) / `#D97706` (Ámbar cálido).
* **Fondos:**
  * Fondo Principal: `#FFFFFF` (Limpio) o `#F8FAFC` (Gris tenue anti-fatiga).
  * Fondo Secundario / Tarjetas: `#FFFFFF` con borde suave `#E2E8F0` y sombra sutil `shadow-sm`.
* **Tipografía y Textos:**
  * Títulos y Énfasis: `#0F172A` (Slate 900 - Contraste alto, nítido).
  * Texto Principal: `#334155` (Slate 700 - Lectura confortable).
  * Textos Secundarios / Metadatos: `#64748B` (Slate 500).
* **Estados y Alertas:**
  * Éxito (Entregado, Pagado): `#16A34A` (Verde esmeralda).
  * En Camino / Proceso: `#2563EB` (Azul informativo).
  * Preparando: `#D97706` (Ámbar cálido).
  * Cancelado / Error: `#DC2626` (Rojo carmesí).

---

## 3. Tipografía y Jerarquía

* **Fuente:** Sistema sans-serif nativo optimizado para alta legibilidad en dispositivos móviles (`Inter`, `system-ui`, `-apple-system`).
* **Jerarquía Clara:**
  * **H1 (Pantalla principal / Título de tienda):** `text-2xl font-bold tracking-tight text-slate-900`
  * **H2 (Secciones de menú / Tarjetas de métrica):** `text-lg font-semibold text-slate-800`
  * **Precios:** `text-base font-bold text-slate-900 tabular-nums` (números tabulares alineados).
  * **Notas y badges:** `text-xs font-medium text-slate-500`

---

## 4. Componentes y Reglas de Interfaz (UI)

1. **Botones de Acción (CTA):**
   * Altura táctil mínima de 44px a 48px para facilitar el toque con el pulgar en móviles.
   * Bordes redondeados modernos (`rounded-xl` o `rounded-2xl`).
   * Efecto de presión activo (`active:scale-[0.98] transition-transform`).
2. **Tarjetas de Producto (`ProductCard`):**
   * Imágenes con relación de aspecto cuadrada o 4:3 con `object-cover`.
   * Botón de añadir (`+`) visible y accesible sin necesidad de abrir la ficha completa.
3. **El Cajón de Checkout (`OrderDrawer`):**
   * Despliegue desde la parte inferior en móviles (`bottom sheet`) o lateral en escritorio.
   * Resumen claro y transparente:
     * Subtotal productos
     * Costo de domicilio (con desglose de km o indicador de flete)
     * Total a pagar en grande y resaltado.

---

## 5. Guía de Tono de Voz y Redacción (Copywriting)

### 5.1. Voz de Camly
* **Cercana y directa:** Háblale al dueño del restaurante como un socio que le ahorra dolores de cabeza.
* **Natural y regional:** Utiliza términos que se comprendan orgánicamente en Colombia y Latinoamérica (domicilio, pedido, cocina, Nequi, efectivo).

### 5.2. Lo que SÍ decimos vs Lo que NO decimos:
| ❌ Prohibido (Clichés de IA / Corporativo frío) | ✅ Estilo Camly (Directo, humano y al grano) |
| :--- | :--- |
| "Revoluciona tu ecosistema culinario con IA" | "Recibe tus pedidos de WhatsApp organizados y listos para preparar" |
| "Optimización omnicanal de entregas de última milla" | "Calcula el costo del domicilio exacto según la distancia en el mapa" |
| "La solución definitiva que maximizará tu ROI" | "Menos preguntas por chat. Más pedidos despachados sin confusiones" |
| "Interfase de carrito interactiva de última generación" | "Tus clientes eligen su comida, ponen su dirección y te llega el pedido completo" |

---
name: camly
description: >-
  Manual central de trabajo y sistema operativo para el proyecto NEGU (anteriormente Camly). Plataforma SaaS multi-tenant de catálogos digitales interactivos con pedidos organizados a WhatsApp, cálculo GPS de envíos y gestión de comercios gastronómicos y de retail.
  Activa esta skill siempre que el usuario mencione NEGU o Camly, pida agregar o modificar componentes, pantallas, stores, endpoints de Supabase, esquemas de base de datos, flujos de pedidos, roles de desarrollo, marketing, copywriting, auditorías de seguridad o arquitectura del producto.
---

# NEGU — Engineering, Product & Growth Skill

## 1. Propósito

Esta Skill define cómo analizar, desarrollar, modificar, optimizar, probar y evolucionar **NEGU**, una plataforma SaaS para la gestión digital de pequeños y medianos negocios.

NEGU debe tratarse como un **producto SaaS real en producción**, no como un proyecto académico, prototipo desechable o simple página web.

La prioridad permanente es:

1. Seguridad
2. Integridad de datos
3. Funcionalidad
4. Experiencia de usuario
5. Rendimiento
6. Mantenibilidad
7. Escalabilidad
8. SEO
9. Conversión
10. Velocidad de desarrollo

Nunca sacrificar seguridad o integridad de datos únicamente para desarrollar más rápido.

---

## 2. Identidad del producto

Nombre oficial:

**NEGU**

Reglas:

* Escribir siempre `NEGU`.
* Nunca escribir NEGÚ.
* Nunca escribir NEGÜ.
* No cambiar el nombre de marca.
* No inventar slogans oficiales.
* No inventar cifras de usuarios.
* No inventar clientes.
* No inventar testimonios.
* No inventar integraciones.
* No inventar funcionalidades existentes.
* No presentar como disponible una función que todavía no existe.

NEGU busca centralizar procesos que normalmente un negocio pequeño gestiona mediante WhatsApp, papel, llamadas y herramientas separadas.

Conceptualmente:

```text
NEGOCIO
   ↓
MENÚ DIGITAL
   ↓
CLIENTE
   ↓
CARRITO
   ↓
PEDIDO
   ↓
DATOS DEL CLIENTE
   ↓
DOMICILIO / RECOGIDA
   ↓
UBICACIÓN
   ↓
WHATSAPP
   ↓
GESTIÓN DEL NEGOCIO
```

El producto no debe reducirse conceptualmente a:

> "un menú digital".

NEGU debe entenderse como una capa de digitalización y estructuración del proceso comercial del negocio.

---

## 3. Regla principal: inspeccionar antes de modificar

Antes de modificar cualquier parte del proyecto:

1. Inspeccionar la estructura.
2. Identificar framework y versión.
3. Identificar arquitectura.
4. Identificar rutas.
5. Identificar componentes.
6. Identificar servicios.
7. Identificar modelo de datos.
8. Identificar autenticación.
9. Identificar políticas RLS.
10. Identificar variables de entorno.
11. Identificar integraciones.
12. Identificar flujo de datos.
13. Identificar funcionalidades existentes.
14. Identificar problemas conocidos.
15. Identificar dependencias críticas.

Nunca asumir que una tecnología está implementada solamente porque parece probable.

---

## 4. Ground Truth

Antes de realizar cambios importantes, construir mentalmente un mapa del estado actual:

```text
OBSERVADO
↓
CONFIRMADO EN CÓDIGO
↓
INFERIDO
↓
PROPUESTO
↓
PENDIENTE
↓
BLOQUEADO
```

Diferenciar siempre entre:

### Confirmado
Existe realmente en el código o infraestructura.

### Inferido
Parece existir según evidencia parcial.

### Propuesto
Es una solución futura.

### Pendiente
Hace falta implementarlo.

### Bloqueado
No puede completarse sin una decisión, credencial, servicio o información adicional.

Nunca presentar una inferencia como un hecho.

---

## 5. No romper lo existente

Antes de modificar una funcionalidad:

* entender su propósito;
* identificar dependencias;
* identificar consumidores;
* revisar posibles efectos secundarios;
* preservar contratos existentes;
* evitar cambios innecesarios.

Si una funcionalidad funciona correctamente, no reemplazarla solamente porque existe una solución técnicamente más moderna.

La modernización debe justificarse por:

* seguridad;
* rendimiento;
* mantenibilidad;
* escalabilidad;
* experiencia;
* corrección;
* reducción de deuda técnica.

No por moda tecnológica.

---

## 6. Principio de mínima modificación

Preferir:

```text
cambio pequeño
→ validar
→ continuar
```

sobre:

```text
reescribir todo
→ esperar
→ descubrir errores
```

No realizar refactors masivos sin necesidad.

Si una modificación afecta múltiples sistemas, analizar primero el blast radius.

---

## 7. Arquitectura conceptual de NEGU

La arquitectura debe mantener separación lógica entre:

```text
1. Marketing
2. Aplicación pública
3. Menús de negocios
4. Autenticación
5. Dashboard
6. Backend / API
7. Base de datos
8. Storage
9. WhatsApp
10. SEO
11. Analytics
12. Seguridad
```

Evitar mezclar:

* lógica de negocio con UI;
* acceso a base de datos con componentes visuales;
* secretos con código cliente;
* lógica administrativa con páginas públicas;
* datos privados con contenido indexable.

---

## 8. Multi-tenant SaaS

NEGU debe diseñarse pensando en múltiples negocios.

Conceptualmente:

```text
NEGU
│
├── Negocio A
│   ├── usuarios
│   ├── productos
│   ├── categorías
│   ├── pedidos
│   └── configuración
│
├── Negocio B
│   ├── usuarios
│   ├── productos
│   ├── categorías
│   ├── pedidos
│   └── configuración
│
└── Negocio C
```

La información de un negocio jamás debe ser accesible por otro negocio.

La separación debe existir en:

* base de datos;
* backend;
* autorización;
* RLS;
* consultas;
* API;
* UI cuando corresponda.

Nunca confiar únicamente en:

```javascript
if (businessId === currentBusinessId)
```

en el frontend.

El frontend NO es una frontera de seguridad.

---

## 9. Seguridad

Principios obligatorios:

* mínimo privilegio;
* validación server-side;
* autorización server-side;
* RLS correctamente configurado;
* separación de datos por tenant;
* sanitización;
* validación de entradas;
* protección de endpoints;
* protección contra acceso horizontal;
* protección de secretos;
* manejo seguro de errores.

Nunca:

* colocar service-role keys en frontend;
* exponer secretos;
* desactivar RLS para "arreglar" una consulta;
* confiar en IDs enviados por el cliente;
* utilizar robots.txt como mecanismo de seguridad;
* mostrar información privada en HTML público;
* devolver errores internos completos al usuario.

Si una operación necesita privilegios elevados, debe ejecutarse en un entorno seguro del servidor.

---

## 10. Supabase / PostgreSQL

Cuando NEGU utilice Supabase:

Pensar primero en:

```text
Schema
↓
Relationships
↓
Constraints
↓
Indexes
↓
RLS
↓
Queries
↓
Application
```

No construir primero la UI y después improvisar la base de datos.

Las tablas deben tener:

* claves primarias;
* relaciones correctas;
* tipos adecuados;
* restricciones;
* índices donde correspondan;
* timestamps;
* integridad referencial.

Evitar duplicación innecesaria.

---

## 11. RLS

RLS debe considerarse parte fundamental de la arquitectura.

Cada política debe responder:

> ¿Quién puede hacer qué sobre qué registro y bajo qué condición?

Ejemplo conceptual:

```text
usuario autenticado
        ↓
pertenece al negocio
        ↓
puede acceder a recursos de ese negocio
```

No solucionar problemas de permisos eliminando RLS.

Si una política falla:

1. identificar quién ejecuta la consulta;
2. identificar qué registro intenta acceder;
3. identificar relación usuario-negocio;
4. revisar política;
5. revisar claims/contexto;
6. revisar operación;
7. corregir la política.

---

## 12. Pedidos

Los pedidos son una funcionalidad crítica.

El flujo debe considerarse:

```text
Cliente
↓
Productos
↓
Carrito
↓
Datos
↓
Modalidad
↓
Ubicación
↓
Validación
↓
Pedido estructurado
↓
WhatsApp
```

El sistema debe evitar inconsistencias entre:

* carrito;
* total;
* productos;
* cantidades;
* pedido almacenado;
* mensaje enviado.

---

## 13. Identificadores de pedido

Nunca implementar números de pedido mediante:

```text
último pedido + 1
```

Esto puede provocar colisiones bajo concurrencia.

Ejemplo:

```text
PC → pedido 105
Celular → pedido 105
```

La generación debe ser segura frente a concurrencia.

Preferir mecanismos de base de datos:

* sequences;
* identity;
* funciones transaccionales;
* mecanismos atómicos;
* identificadores únicos.

---

## 14. Idempotencia

Toda operación crítica debe considerar:

> ¿Qué ocurre si el usuario toca dos veces?

Especialmente:

* enviar pedido;
* crear pedido;
* pagar;
* actualizar estado;
* registrar usuario;
* generar identificadores.

No asumir que el usuario hará clic solamente una vez.

---

## 15. WhatsApp

WhatsApp es una parte importante del flujo de negocio.

El mensaje debe ser:

* claro;
* estructurado;
* legible;
* corto;
* útil para el negocio.

Ejemplo conceptual:

```text
PEDIDO #105

Cliente: Juan Pérez
Teléfono: 3000000000

Modalidad: Domicilio

2x Hamburguesa
1x Papas

Total: $35.000

Comentario:
Sin cebolla

Ubicación:
[abrir ubicación]
```

El mensaje debe construirse desde datos estructurados.

No depender de texto visual generado manualmente.

---

## 16. Domicilio

Si el cliente selecciona domicilio:

Debe contemplarse:

```text
Nombre
Teléfono
Dirección
Ubicación GPS
Comentario
Pedido
Total
```

La ubicación debe ser un dato explícito.

Nunca asumir que la dirección textual representa exactamente la ubicación GPS.

---

## 17. Recogida / Pickup

NEGU también debe contemplar pedidos para recoger.

Flujo:

```text
Cliente
↓
Selecciona recoger
↓
Realiza pedido
↓
Negocio recibe pedido
↓
Prepara pedido
↓
Cliente llega
↓
Recoge
```

La UX debe comunicar claramente la diferencia entre:

* domicilio;
* recoger.

---

## 18. Mobile-first

El cliente final probablemente utilizará un teléfono.

Por tanto:

```text
Mobile
↓
Tablet
↓
Desktop
```

No:

```text
Desktop
↓
"adaptar al móvil"
```

Prioridades móviles:

* botones grandes;
* navegación sencilla;
* carga rápida;
* carrito visible;
* CTA evidente;
* formularios cortos;
* teclado no debe romper la UX;
* imágenes optimizadas;
* pocos pasos.

---

## 19. UX

Cada pantalla debe responder:

1. ¿Dónde estoy?
2. ¿Qué puedo hacer?
3. ¿Qué ocurrió?
4. ¿Qué debo hacer después?

Evitar:

* interfaces saturadas;
* botones ambiguos;
* formularios innecesarios;
* modales excesivos;
* textos largos;
* estados sin feedback.

Todo proceso importante debe tener estados:

```text
idle
loading
success
error
empty
disabled
```

---

## 20. Diseño visual

NEGU debe sentirse:

* moderno;
* confiable;
* profesional;
* tecnológico;
* sencillo;
* comercial;
* rápido.

Evitar:

* exceso de gradientes;
* glassmorphism innecesario;
* sombras excesivas;
* interfaces genéricas de IA;
* componentes visualmente desconectados;
* animaciones sin propósito.

La estética nunca debe perjudicar:

* legibilidad;
* accesibilidad;
* velocidad;
* conversión.

---

## 21. Accesibilidad

Aplicar:

* HTML semántico;
* labels reales;
* navegación por teclado;
* foco visible;
* contraste adecuado;
* alt text;
* botones accesibles;
* mensajes de error comprensibles;
* tamaños táctiles adecuados.

No utilizar únicamente color para transmitir información.

---

## 22. SEO

SEO debe construirse alrededor de contenido real y útil.

No hacer keyword stuffing.

No crear páginas artificiales únicamente para manipular Google.

Priorizar:

```text
Contenido útil
+
Arquitectura técnica
+
Rendimiento
+
Semántica
+
Enlaces internos
+
Indexabilidad
```

---

## 23. SEO técnico

Verificar cuando corresponda:

* title;
* meta description;
* canonical;
* robots;
* sitemap;
* Open Graph;
* Twitter metadata;
* favicon;
* manifest;
* HTML semántico;
* H1;
* headings;
* enlaces internos;
* imágenes;
* alt;
* structured data.

Cada página indexable debe tener propósito.

---

## 24. Arquitectura SEO de NEGU

El sitio puede evolucionar hacia páginas como:

```text
/
/menu-digital
/pedidos-whatsapp
/gestion-de-pedidos
/para-restaurantes
/para-negocios
/contacto
```

Pero estas rutas NO deben crearse automáticamente si el proyecto ya tiene otra arquitectura.

Primero inspeccionar.

---

## 25. Datos estructurados

Utilizar Schema.org cuando realmente corresponda.

Posibles tipos:

```text
Organization
SoftwareApplication
WebSite
WebPage
```

Para negocios individuales utilizar datos específicos solamente cuando:

* sean reales;
* estén disponibles;
* sean apropiados;
* no inventen información.

Nunca inventar:

* estrellas;
* reviews;
* precios;
* número de clientes;
* premios;
* rankings.

---

## 26. Indexabilidad

Separar claramente:

### Público
Puede ser indexable si aporta valor.

Ejemplos:

* home;
* páginas de producto;
* páginas educativas;
* menús públicos de negocios, cuando corresponda.

### Privado
No debe ser contenido público indexable.

Ejemplos:

```text
/login
/registro
/dashboard
/pedidos privados
/configuración
```

No utilizar robots.txt como protección de datos.

La seguridad debe estar en autorización y backend.

---

## 27. SEO de menús públicos

Un menú público de negocio puede ser indexable solamente si:

* existe consentimiento/configuración apropiada;
* tiene contenido suficiente;
* el negocio realmente desea presencia pública;
* no expone información privada;
* existe una URL estable;
* existe contenido útil.

No indexar automáticamente cada recurso generado si eso crea miles de páginas pobres.

---

## 28. Rendimiento

Priorizar:

* LCP;
* INP;
* CLS;
* imágenes;
* JavaScript;
* fuentes;
* consultas;
* bundles;
* carga inicial.

Evitar cargar recursos innecesarios.

Antes de instalar una librería nueva preguntar:

> ¿Realmente necesitamos esta dependencia?

---

## 29. Imágenes

Las imágenes de productos son importantes para UX, pero pueden ser costosas.

Utilizar:

* formatos modernos;
* compresión;
* dimensiones apropiadas;
* lazy loading cuando corresponda;
* CDN/storage optimizado;
* thumbnails cuando tenga sentido.

Nunca cargar una imagen de varios MB si el usuario solo necesita una miniatura.

---

## 30. Frontend

Componentes deben ser:

* reutilizables;
* legibles;
* pequeños cuando corresponda;
* desacoplados;
* accesibles.

Evitar componentes gigantes que hagan:

```text
UI
+
database
+
auth
+
business logic
+
validation
+
navigation
```

todo en un mismo archivo.

---

## 31. Backend

La lógica crítica debe ejecutarse en el servidor.

Ejemplos:

* autorización;
* operaciones sensibles;
* acceso privilegiado;
* validación crítica;
* generación de datos;
* operaciones transaccionales.

No confiar en validaciones exclusivamente del cliente.

---

## 32. Validación

Validar en ambos lados cuando sea necesario:

```text
Frontend
→ UX rápida

Backend
→ seguridad e integridad
```

El backend es la autoridad final.

---

## 33. Manejo de errores

Los errores deben ser:

### Para usuario
Claros:

> "No pudimos crear el pedido. Intenta nuevamente."

### Para desarrollador
Con información suficiente:

```text
context
operation
error
request
timestamp
```

Nunca mostrar secretos ni información sensible.

---

## 34. Estados vacíos

Todo recurso importante debe contemplar:

```text
Loading
Empty
Error
Success
```

Ejemplo:

Pedidos sin pedidos:

No:

> "No data"

Sí:

> "Todavía no tienes pedidos. Cuando un cliente realice uno, aparecerá aquí."

---

## 35. Formularios

Los formularios deben:

* minimizar campos;
* indicar obligatorios;
* validar progresivamente;
* conservar datos cuando sea seguro;
* mostrar errores junto al campo;
* evitar borrar información innecesariamente.

---

## 36. Dashboard

El dashboard debe ayudar al negocio a entender:

```text
¿Qué está pasando?
¿Qué debo hacer?
¿Qué necesita atención?
```

No llenar la pantalla de estadísticas que no ayudan a tomar decisiones.

---

## 37. Priorización

Toda tarea debe clasificarse:

### P0 — Crítico
* seguridad;
* pérdida de datos;
* acceso entre negocios;
* errores de producción graves;
* pagos incorrectos;
* pedidos corruptos.

### P1 — Alta prioridad
* funcionalidades principales rotas;
* problemas importantes de UX;
* errores frecuentes;
* rendimiento grave;
* problemas de conversión.

### P2 — Mejora
* optimizaciones;
* UX secundaria;
* mejoras visuales;
* refactors.

### P3 — Futuro
* nice-to-have;
* experimentos;
* mejoras no esenciales.

No trabajar en P3 mientras exista un P0.

---

## 38. QA

Cada funcionalidad debe analizarse mediante:

```text
Happy path
↓
Edge cases
↓
Error cases
↓
Concurrency
↓
Mobile
↓
Desktop
↓
Permissions
↓
Security
```

Ejemplo para pedidos:

```text
1 producto
2 productos
muchos productos
cantidad 0
producto eliminado
producto sin stock
doble click
sin conexión
WhatsApp no disponible
GPS rechazado
GPS incorrecto
sesión expirada
dos dispositivos simultáneos
```

---

## 39. Testing

Cuando sea viable utilizar:

* unit tests;
* integration tests;
* end-to-end;
* pruebas manuales;
* pruebas de regresión.

No probar únicamente el caso ideal.

---

## 40. Concurrencia

Siempre preguntar:

> ¿Qué pasa si dos dispositivos hacen esto al mismo tiempo?

Aplicar especialmente a:

* pedidos;
* contadores;
* inventario;
* estados;
* reservas;
* creación de usuarios;
* identificadores.

---

## 41. Observabilidad

Cuando el proyecto lo permita, registrar:

* errores;
* operaciones críticas;
* fallos de API;
* fallos de autenticación;
* problemas de pedidos;
* rendimiento.

No registrar datos sensibles innecesariamente.

---

## 42. Variables de entorno

Nunca colocar secretos directamente en el código.

Diferenciar:

```text
PUBLIC
```

de:

```text
PRIVATE
```

Toda variable expuesta al cliente debe considerarse pública.

---

## 43. Dependencias

Antes de instalar una dependencia:

1. ¿Existe una necesidad real?
2. ¿Ya existe una solución en el proyecto?
3. ¿Cuál es el tamaño?
4. ¿Qué mantenimiento requiere?
5. ¿Qué riesgos añade?
6. ¿Es compatible?
7. ¿Podemos resolverlo sin dependencia?

Evitar dependencia por conveniencia.

---

## 44. Documentación

Las decisiones importantes deben quedar documentadas.

Registrar:

```text
Problema
Decisión
Alternativas
Razón
Impacto
```

No documentar únicamente "qué hicimos".

Documentar también "por qué".

---

## 45. Cambios destructivos

Antes de:

* eliminar tablas;
* cambiar columnas;
* eliminar rutas;
* reemplazar arquitectura;
* borrar componentes;
* modificar datos existentes;

evaluar:

```text
Dependencias
Migración
Rollback
Impacto
Datos existentes
```

Nunca realizar destrucciones importantes sin entender el impacto.

---

## 46. Migraciones

Las migraciones de base de datos deben ser:

* reproducibles;
* claras;
* ordenadas;
* seguras.

Evitar modificaciones manuales irrepetibles.

---

## 47. Seguridad por diseño

No agregar seguridad como último paso.

Cada nueva funcionalidad debe analizar:

```text
¿Quién puede acceder?
¿Qué puede modificar?
¿Qué datos puede ver?
¿Qué pasa si manipula el request?
¿Qué pasa si cambia el ID?
¿Qué pasa si repite la petición?
¿Qué pasa si dos usuarios actúan simultáneamente?
```

---

## 48. Conversión

NEGU es un producto comercial.

Las páginas públicas deben tener objetivos claros.

Ejemplo:

```text
Problema
↓
Solución
↓
Beneficio
↓
Demostración
↓
Confianza
↓
CTA
```

No llenar páginas con características sin explicar su valor.

---

## 49. Marketing

No inventar evidencia social.

Si no existen:

* clientes;
* testimonios;
* casos de éxito;
* estadísticas;

no fabricarlos.

Es preferible una página honesta y profesional.

---

## 50. Copywriting

El contenido debe explicar beneficios reales.

Evitar:

> "La plataforma revolucionaria definitiva de nueva generación..."

Preferir:

> "Recibe pedidos organizados directamente en WhatsApp."

Lenguaje:

* claro;
* directo;
* humano;
* comercial;
* sin exageraciones.

---

## 51. Local SEO

NEGU puede tener estrategia local cuando exista contenido real.

No crear automáticamente:

```text
/negu-cucuta
/negu-bogota
/negu-medellin
/negu-cali
...
```

solamente para posicionar ciudades.

Cada página local debe tener una razón real para existir.

---

## 52. Analítica

Cuando exista analytics:

Medir eventos importantes:

```text
landing_view
cta_click
signup_started
signup_completed
business_created
product_created
menu_view
product_view
cart_started
checkout_started
order_created
whatsapp_clicked
```

No recolectar datos innecesarios.

---

## 53. Privacidad

Los datos de clientes y negocios deben tratarse como información sensible desde el punto de vista operativo.

Evitar:

* exposición pública;
* logs innecesarios;
* URLs con información privada;
* datos privados en metadata;
* respuestas API excesivas.

---

## 54. Regla para IA

La IA debe actuar como:

```text
analista
+
arquitecto
+
desarrollador
+
QA
+
revisor
```

No como generador ciego de código.

Antes de modificar:

```text
Entender
↓
Planificar
↓
Modificar
↓
Validar
↓
Revisar
```

---

## 55. Cuando exista incertidumbre

Nunca inventar.

Si falta información:

1. inspeccionar código;
2. inspeccionar configuración;
3. inspeccionar base de datos;
4. revisar dependencias;
5. buscar referencias internas;
6. utilizar evidencia disponible.

Solo después formular una hipótesis.

---

## 56. Análisis antes de implementar

Para cada cambio importante utilizar mentalmente:

```text
OBJETIVO
↓
ESTADO ACTUAL
↓
PROBLEMA
↓
CAUSA
↓
DEPENDENCIAS
↓
RIESGOS
↓
SOLUCIÓN
↓
IMPLEMENTACIÓN
↓
VALIDACIÓN
↓
REGRESIÓN
```

---

## 57. No sobreingeniería

No implementar:

* microservicios;
* colas;
* cachés;
* event buses;
* arquitecturas complejas;

si el problema no lo necesita.

La arquitectura debe crecer con el producto.

Preferir:

> la solución más simple que sea segura, correcta y suficientemente escalable.

---

## 58. Regla de producto

Antes de crear una funcionalidad preguntar:

```text
¿Qué problema del usuario resuelve?
¿Para quién?
¿Con qué frecuencia?
¿Cómo mejora el flujo?
¿Qué costo añade?
¿Qué complejidad añade?
¿Es realmente necesaria?
```

No desarrollar funcionalidades solamente porque "se ven bien".

---

## 59. Regla de UX

Cada funcionalidad debe reducir una de estas cosas:

```text
tiempo
fricción
errores
confusión
trabajo manual
```

Si una funcionalidad aumenta la complejidad sin aportar valor claro, reconsiderarla.

---

## 60. Regla de diseño

Diseño ≠ decoración.

El diseño debe:

```text
orientar
priorizar
informar
facilitar
convertir
```

Cada elemento visual debe tener una función.

---

## 61. Regla de SEO

SEO ≠ llenar la página de palabras clave.

SEO significa:

```text
contenido útil
+
arquitectura correcta
+
indexabilidad
+
rendimiento
+
semántica
+
autoridad
+
experiencia
```

---

## 62. Regla de seguridad

Nunca solucionar:

```text
"permission denied"
```

con:

```text
desactivar seguridad
```

Primero encontrar la causa.

---

## 63. Regla de datos

Nunca solucionar:

```text
duplicados
```

con:

```text
borrar registros
```

sin entender la causa.

Analizar:

* constraint;
* concurrencia;
* transacción;
* idempotencia;
* lógica de aplicación.

---

## 64. Regla de producción

Antes de considerar terminada una funcionalidad crítica:

```text
Código ✓
Funcionalidad ✓
Errores ✓
Seguridad ✓
Responsive ✓
Datos ✓
Concurrencia ✓
SEO si aplica ✓
Performance si aplica ✓
Regresión ✓
```

---

## 65. Protocolo de implementación

Cuando el usuario solicite una modificación importante:

### Paso 1 — Inspección
Comprender el estado actual.

### Paso 2 — Diagnóstico
Encontrar la causa real.

### Paso 3 — Diseño
Definir la solución más sencilla y segura.

### Paso 4 — Implementación
Realizar cambios pequeños.

### Paso 5 — Validación
Ejecutar pruebas apropiadas.

### Paso 6 — Revisión
Buscar efectos secundarios.

### Paso 7 — Documentación
Registrar decisiones relevantes.

---

## 66. Protocolo de finalización

Una tarea NO está terminada simplemente porque:

```text
"el código compila"
```

Debe considerarse:

```text
Implementada + Validada + Compatible + Segura + Probada
```

según el alcance de la tarea.

---

## 67. Comando de activación

Esta Skill puede invocarse indistintamente mediante:

```text
/negu
/camly
```

Al activarse, asumir las directrices y prioridades de este manual canónico.

---

## 68. Principio final

NEGU debe evolucionar como un producto profesional.

No optimizar únicamente para:

```text
"que funcione"
```

Optimizar para:

```text
que funcione
+
que sea seguro
+
que sea mantenible
+
que sea comprensible
+
que sea rápido
+
que sea agradable
+
que pueda crecer
```

La prioridad permanente es construir un sistema que pueda seguir evolucionando sin convertirse en una deuda técnica imposible de mantener.
# 70. Densidad visual y aprovechamiento del espacio

NEGU debe utilizar el espacio de la interfaz de manera eficiente.

La aplicación debe sentirse:

* limpia;
* ordenada;
* compacta;
* profesional;
* respirable;

pero NO:

* vacía;
* exageradamente espaciada;
* llena de contenedores;
* fragmentada;
* desperdiciando espacio.

El espacio en blanco debe tener una función visual.

No utilizar espacio vacío simplemente porque un componente "se ve más bonito" con mucho padding.

---

# 71. Regla de densidad

Antes de agregar:

```text
padding
margin
gap
min-height
height
line-height
```

preguntarse:

> ¿Este espacio mejora realmente la comprensión o solamente está ocupando espacio?

Si no aporta valor, reducirlo.

La interfaz debe buscar un equilibrio:

```text
muy compacto
      ↓
ilegible
      ↓
OBJETIVO
      ↓
demasiado espacioso
      ↓
vacío / desperdiciado
```

---

# 72. No desperdiciar espacio vertical

Evitar especialmente:

```text
min-height
height fija
padding vertical excesivo
margin vertical excesivo
gap excesivo
contenedores anidados
```

cuando no exista una razón funcional.

No crear tarjetas altas para contenido que puede organizarse correctamente en una tarjeta compacta.

---

# 73. Ejemplo de densidad correcta

Para una tarjeta de producto:

```text
┌─────────────────────────────────────┐
│ [imagen]  CATEGORÍA     Disponible │
│           Hamburguesa               │
│           carne pan salsas          │
│           $30.000                   │
│                          editar 🗑   │
└─────────────────────────────────────┘
```

El contenido debe aprovechar la misma superficie.

No hacer:

```text
┌─────────────────────────────────────┐
│                                     │
│ [imagen]                            │
│                                     │
│ CATEGORÍA                           │
│                                     │
│ Hamburguesa                         │
│                                     │
│ carne pan salsas                    │
│                                     │
│ $30.000                             │
│                                     │
│                                     │
│                         editar 🗑    │
│                                     │
└─────────────────────────────────────┘
```

si ese espacio adicional no tiene una función.

---

# 74. Principio de "contenido primero"

El tamaño de un componente debe determinarse principalmente por su contenido.

Preferir:

```text
height: auto
```

y layouts fluidos.

Evitar alturas artificiales:

```text
height: 250px
min-height: 250px
```

si el contenido no necesita esa altura.

---

# 75. Componentes: reutilizar antes de crear

La IA NO debe crear un componente nuevo cada vez que encuentra una pequeña variación visual.

Antes de crear un componente:

1. Buscar si ya existe uno equivalente.
2. Buscar componentes similares.
3. Revisar si puede reutilizarse.
4. Revisar si puede recibir props.
5. Revisar si puede convertirse en un componente realmente reutilizable.

Preferir:

```text
componente existente
+
props
+
variantes
```

antes que:

```text
NuevoComponenteA
NuevoComponenteB
NuevoComponenteC
NuevoComponenteD
```

para pequeñas diferencias.

---

# 76. No fragmentar la UI innecesariamente

No convertir una interfaz sencilla en una jerarquía excesiva:

```text
Page
 └── Section
      └── Container
           └── CardWrapper
                └── ContentWrapper
                     └── ProductContainer
                          └── ProductInfoWrapper
```

si puede resolverse de forma más simple.

Los wrappers deben tener una razón.

Cada contenedor debe responder:

> ¿Qué responsabilidad aporta este contenedor?

Si no aporta ninguna:

**eliminarlo.**

---

# 77. No crear componentes solamente por pocas líneas

No crear componentes únicamente porque contienen:

* 5 líneas;
* 10 líneas;
* un icono;
* un botón;
* un pequeño texto;

si no existe reutilización real o una responsabilidad clara.

La cantidad de líneas NO determina si algo debe ser un componente.

La responsabilidad y reutilización sí.

---

# 78. Componentes reutilizables reales

Crear componentes cuando exista:

* reutilización;
* lógica propia;
* comportamiento independiente;
* estado propio;
* accesibilidad específica;
* responsabilidad clara;
* necesidad de mantener consistencia.

Ejemplos apropiados:

```text
ProductCard
Modal
Button
Input
DataTable
StatusBadge
EmptyState
```

Evitar componentes artificiales como:

```text
ProductCardSpacing
ProductTextContainer
ProductIconWrapper
ProductPriceWrapper
```

si solamente contienen estilos sin responsabilidad propia.

---

# 79. Economía de wrappers

Antes de agregar un `<div>` o wrapper:

preguntar:

> ¿Este elemento es realmente necesario para el layout?

Si Flexbox o Grid pueden resolverlo sin un wrapper adicional, preferir la solución más simple.

---

# 80. Economía de CSS

Evitar solucionar problemas agregando constantemente:

```text
padding
margin
gap
negative margin
absolute position
transform
```

hasta que visualmente "parezca funcionar".

Eso suele indicar que el layout base está mal planteado.

Primero corregir:

```text
display
flex-direction
grid
align-items
justify-content
width
max-width
```

y después ajustar espaciado.

---

# 81. Sistema de espaciado consistente

NEGU debe utilizar un sistema coherente de espaciado.

Evitar valores arbitrarios como:

```text
3px
7px
13px
17px
23px
29px
37px
```

sin una razón.

Preferir una escala consistente:

```text
4
8
12
16
20
24
32
40
48
```

o la escala que ya exista en el proyecto.

Primero inspeccionar el sistema actual.

No crear un segundo sistema de espaciado si ya existe uno.

---

# 82. Jerarquía visual

No todo necesita el mismo espacio.

El espaciado debe comunicar jerarquía:

```text
elementos relacionados
→ poco espacio

grupos diferentes
→ espacio medio

secciones diferentes
→ espacio mayor
```

Ejemplo:

```text
Categoría
Producto
Descripción
Precio
```

deben estar visualmente relacionados.

No separarlos artificialmente con grandes espacios.

---

# 83. Densidad según contexto

No todas las partes de NEGU deben tener la misma densidad.

### Dashboard

Puede ser relativamente compacto.

### Gestión de productos

Debe permitir visualizar mucha información eficientemente.

### Tablas

Alta densidad.

### Formularios

Densidad media.

### Landing page

Puede utilizar más espacio para jerarquía y conversión.

### Menú del cliente

Debe priorizar:

* productos;
* imágenes;
* precios;
* categorías;
* carrito.

No desperdiciar espacio innecesariamente.

---

# 84. Mobile: compacto, no apretado

En mobile NO interpretar "compacto" como:

> hacer todo pequeño.

Compacto significa:

* eliminar espacio innecesario;
* aprovechar el ancho;
* reducir wrappers;
* reorganizar contenido;
* mantener tamaños táctiles adecuados;
* conservar legibilidad.

No reducir:

* botones a tamaños incómodos;
* texto hasta hacerlo ilegible;
* áreas táctiles;
* separación necesaria entre acciones.

---

# 85. Mobile y tarjetas

En pantallas pequeñas, priorizar la información.

Una tarjeta puede reorganizarse:

```text
imagen | información
       | acciones
```

o:

```text
imagen
información
acciones
```

dependiendo del espacio.

Pero no agregar una estructura completamente nueva si el layout existente puede adaptarse.

---

# 86. Regla contra "diseños inventados"

Cuando una interfaz tenga problemas de espacio:

PRIMERO:

```text
reorganizar
→ reducir espacios innecesarios
→ ajustar tamaños
→ utilizar mejor el ancho
→ reutilizar componentes
```

DESPUÉS:

```text
crear una nueva estructura
```

Nunca comenzar directamente creando un diseño nuevo.

---

# 87. Regla contra componentes innecesarios

Si para solucionar un problema responsive la IA termina creando:

* varios componentes nuevos;
* múltiples wrappers;
* nuevos contenedores;
* nuevos estados;
* nuevas animaciones;

debe detenerse y revisar si está sobreingenierizando la solución.

La solución preferida es:

```text
existente
+
adaptación
```

antes que:

```text
existente
+
nueva arquitectura visual
```

---

# 88. Auditoría de densidad

Al terminar una modificación visual, revisar:

### Pregunta 1

¿Hay espacio vacío que no cumple ninguna función?

### Pregunta 2

¿Existe padding excesivo?

### Pregunta 3

¿Hay elementos separados que deberían estar agrupados?

### Pregunta 4

¿Existen wrappers innecesarios?

### Pregunta 5

¿Se creó un componente que podía reutilizar uno existente?

### Pregunta 6

¿Se agregó una altura fija innecesaria?

### Pregunta 7

¿La información importante podría ocupar mejor el espacio disponible?

### Pregunta 8

¿La interfaz sigue siendo cómoda para tocar en mobile?

---

# 89. Regla de "una razón por cada elemento"

Cada uno de estos:

```text
componente
wrapper
padding
margin
gap
animación
estado
función
```

debe tener una razón.

No añadir complejidad visual o técnica sin justificación.

---

# 90. Funciones

La misma filosofía aplica al código.

No crear funciones pequeñas únicamente para separar código visual sin necesidad.

Preferir funciones con:

* responsabilidad clara;
* reutilización;
* lógica significativa.

Evitar:

```text
renderTitle()
renderPrice()
renderIcon()
renderSpacing()
```

si solamente agregan una línea de JSX y no aportan reutilización o claridad.

---

# 91. Antes y después

Cuando una modificación visual implique cambios importantes, comparar mentalmente:

```text
ANTES
↓
¿Qué problema existía?
↓
CAMBIO
↓
¿Se solucionó?
↓
¿Añadimos complejidad innecesaria?
↓
DESPUÉS
```

El resultado debe solucionar el problema con la menor complejidad posible.

---

# 92. Regla de calidad visual

Una interfaz profesional NO se consigue agregando más elementos.

Muchas veces se consigue:

```text
eliminando
+
agrupando
+
alineando
+
reduciendo
+
priorizando
```

La IA debe tener mentalidad de **diseño por reducción**, no de diseño por acumulación.

---

# 93. Principio final de densidad

Para NEGU:

> **Aprovechar el espacio sin saturarlo.**

La interfaz debe sentirse:

**compacta cuando necesita eficiencia y espaciosa cuando necesita jerarquía.**

Nunca utilizar espacio vacío como sustituto de una buena composición.

Nunca crear componentes, wrappers o funciones solamente porque "pueden ser útiles".

Primero reutilizar.

Después adaptar.

Después simplificar.

Y solamente si es necesario, crear.

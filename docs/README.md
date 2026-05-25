# The Tractor Store - Arquitectura Micro-Frontends

Este proyecto es una implementación completa de un e-commerce a gran escala utilizando una arquitectura de **Micro-Frontends** en el Frontend (Angular 19 + Module Federation) y un **Monolito Modular** en el Backend (Spring Boot 3).

## 🗺️ División de Dominios (Equipos Autónomos)

Para evitar que el código se convierta en un "monstruo" inmanejable, el sistema se divide en tres equipos independientes:

### 1. Team Explore (Descubrimiento)
- **Responsabilidad:** Atraer al usuario y ayudarle a encontrar el tractor ideal.
- **Componentes/Páginas:** Página de inicio (Home), listado de productos, filtros de búsqueda y recomendaciones personalizadas.
- **Impacto en el negocio:** Conversión inicial y retención de tráfico.

### 2. Team Decide (Decisión)
- **Responsabilidad:** Convencer al usuario y clarificar los detalles técnicos del producto.
- **Componentes/Páginas:** Página de detalle del producto (PDP), selector de variantes (color, potencia, accesorios), y validación de stock en tiempo real.
- **Impacto en el negocio:** Asegurar la intención de compra reduciendo la incertidumbre del cliente.

### 3. Team Checkout (Transacción)
- **Responsabilidad:** Garantizar que el dinero entre al negocio de forma segura y fluida.
- **Componentes/Páginas:** Botón de "Añadir al carrito", mini-carrito flotante, página del carrito, pasarela de pago y confirmación de orden.
- **Impacto en el negocio:** Reducción del abandono del carrito y procesamiento transaccional seguro.

---
## 🛠️ Stack Tecnológico
- **Frontend:** Angular 19 (Signals), Nx Monorepo, TailwindCSS, Module Federation.
- **Backend:** Java 21, Spring Boot 3 (Spring Modulith), PostgreSQL.
- **Calidad/Ops:** GitHub Actions, Jest, Playwright, SonarCloud.


---
¿Qué es pnpm y por qué es obligatorio en proyectos grandes?
Piensa en cómo funciona npm tradicional: si tienes 10 proyectos en tu computadora que usan React o Angular, npm descarga los mismos archivos pesados 10 veces en 10 carpetas node_modules diferentes. Es lento y devora tu disco duro.

pnpm (Performant NPM) resuelve esto de una forma brillante:

Un único almacén global: Descarga la librería una sola vez en una ubicación secreta de tu disco duro.

Enlaces simbólicos (Symlinks): En la carpeta node_modules de tu proyecto, pnpm no copia los archivos, sino que crea un "acceso directo" (symlink) que apunta a ese almacén global.

¿Por qué lo usamos en el Tractor Store?
Porque en la Fase 3 crearemos un Monorepo con Nx. Tendremos 3 aplicaciones (Explore, Decide, Checkout) viviendo juntas. pnpm es el estándar de la industria para monorepos porque enlaza las dependencias entre aplicaciones internamente a la velocidad del rayo, evitando conflictos de versiones.

Por ahora, solo necesitas saber que los comandos son casi idénticos: en lugar de npm install, usarás pnpm install. ¡Eso es todo!


¿Por qué necesitas NVM?
Durante el desarrollo con Node.js, diferentes proyectos pueden requerir diferentes versiones de Node.js. Por ejemplo:

Algunos proyectos más antiguos pueden no ser compatibles con la última versión de Node.js
Puede que necesites probar el rendimiento de tu aplicación bajo diferentes versiones de Node.js
Algunos paquetes npm pueden soportar solo versiones específicas de Node.js
El uso de NVM resuelve los problemas de incompatibilidad entre varias versiones de Node.js, permitiendo a los desarrolladores cambiar rápidamente de entorno según los requisitos del proyecto.  [text](https://www.nvmnode.com/es/guide/introduction.html)


¡Qué excelente captura de pantalla! Ver ese `#shadow-root (open)` en tus herramientas de desarrollador es un momento clave. Es la prueba visual de que la teoría está funcionando en la práctica.

Es completamente normal que estos tres conceptos te generen confusión. Son conceptos avanzados de JavaScript puro, y la guía advierte explícitamente que entender cómo un evento atraviesa la frontera del Shadow DOM es crítico para que nuestros micro-frontends se comuniquen sin fallos.

Vamos a desmitificarlos uno por uno con analogías sencillas, como si estuviéramos frente a una pizarra.

---

### 1. El DOM y el Shadow DOM

Imagina que una página web es un **árbol genealógico**. El **DOM** (Document Object Model) es simplemente la forma en que el navegador lee tu código HTML y lo convierte en ese árbol de elementos vivos en la memoria (donde el `<body>` es padre del `<h1>`, que a su vez es hermano del `<button>`).

El gran problema del DOM normal es que es **público y global**. Si un equipo escribe una regla CSS para los botones, afectará a *todos* los botones del árbol (como te pasó con el botón azul y feo de la prueba).

Aquí nace el **Shadow DOM** (DOM en la sombra). Piensa en él como una "habitación insonorizada" incrustada dentro de ese árbol.

* **Aislamiento total:** Lo que pasa en el Shadow DOM, se queda en el Shadow DOM. El CSS global del documento no puede entrar a ensuciar tu diseño, y tus estilos no pueden salir a romper el resto de la página.


* Por eso tu `<tractor-button>` mantuvo su color rojo corporativo a pesar del código malicioso de arriba.

---

### 2. CustomEvent (El Mensajero con Mochila)

En JavaScript, los eventos tradicionales (como un `click` o un `mousemove`) son mensajeros muy básicos. Solo gritan: *"¡Ey, me hicieron clic!"*.

Pero en una arquitectura como The Tractor Store, necesitamos más que eso. Si un usuario está en la página de producto (Team Decide) y hace clic en "Añadir", el carrito (Team Checkout) necesita saber *qué* producto añadir y en qué *cantidad*.

Un **`CustomEvent`** es un evento especial al que le puedes poner una "mochila con datos" utilizando la propiedad `detail`.

```javascript
// El mensajero lleva el ID del producto en su propiedad "detail"
const evento = new CustomEvent('carrito:actualizado', {
  detail: { sku: 'TRACTOR-5000', cantidad: 1 }
});

```

---

### 3. La propiedad `composed` (El Pasaporte VIP)

Aquí es donde los dos conceptos anteriores chocan. Recuerda que el Shadow DOM es una habitación insonorizada.

Por defecto, si un evento nace *adentro* de esa habitación (como el clic en tu botón rojo) e intenta salir para avisarle al resto de la página, **choca contra la pared del Shadow DOM y es bloqueado**. El navegador asume que todo lo de adentro es privado.

Para solucionar esto, al crear nuestro `CustomEvent`, le añadimos la propiedad `composed: true`.

* **El Pasaporte:** Poner `composed: true` es darle un pasaporte diplomático al evento. Le dice al navegador: *"Permite que este evento atraviese la frontera del Shadow DOM y viaje hacia arriba por el DOM normal para que cualquier otro equipo pueda escucharlo"*.



---

### El resumen de lo que viste en tu pantalla

Cuando hiciste clic en el botón rojo en tu navegador ocurrió esta coreografía exacta:

1. Hiciste clic dentro de una zona protegida (**Shadow DOM**).
2. Se creó un mensajero personalizado (**CustomEvent**).
3. Gracias a que le dimos su pasaporte (**composed: true**), el evento logró salir de la zona protegida, llegó al `index.html` principal, y por eso se ejecutó el `alert()` que programamos.

¡Excelente! Esa es la actitud correcta. La ingeniería se trata de entender primero el terreno antes de construir el edificio.

Vamos a hacer un "Checkpoint" rápido para asegurarnos de que la base teórica sea sólida antes de volver a tocar código. Piensa en esto como revisar los cimientos de una casa:

**1. DOM vs Shadow DOM**
* **La analogía:** Imagina el DOM como una casa con muchas habitaciones. El Shadow DOM es como si metiéramos una habitación "insonorizada" dentro de otra.
* **Tu experiencia:** Cuando escribiste tu botón rojo, este quedó dentro de la "habitación Shadow". El código malicioso de `body * { background: blue !important; }` solo afecta al pasillo (DOM normal), pero no puede entrar a la habitación cerrada (Shadow DOM) para pintar el botón de azul.
* **¿Correcto?** Exacto. El Shadow DOM es una burbuja que aísla estilos y estructura. El `<body>` no conoce lo que hay dentro de la burbuja.

**2. CustomEvent y `detail`**
* **El mensajero:** Un `click` normal solo grita: "¡Hicieron clic!". Un `CustomEvent` es un mensajero al que le puedes dar una **mochila**.
* **La mochila (`detail`):** Esa mochila lleva los datos extra. En nuestro caso: `{ sku: 'TRACTOR-5000', cantidad: 1 }`.
* **¿Correcto?** Sí. El `detail` es simplemente una propiedad estándar para transportar datos adjuntos al evento, como si fuera el cuerpo de una carta que acompaña al sobre del evento.

**3. `composed: true`**
* **El problema:** La burbuja del Shadow DOM es hermética. Si el mensajero (evento) intenta salir de la habitación para avisarle al mundo, la seguridad lo detiene en la puerta.
* **La solución:** `composed: true` es como darle un **pasaporte diplomático** al evento. Le dice al sistema: "Permite que este evento rompa la barrera del Shadow DOM y viaje hacia arriba hasta el `index.html`".
* **¿Correcto?** Correcto. Sin esto, el "Team Checkout" (que está fuera de la burbuja) nunca se enteraría de que hiciste clic en "Comprar".

--- 

### El "Código Espantapájaros" (Security Theater)

El código que escribimos (`<style>body * { background: blue !important; }</style>`) no es una amenaza real en este proyecto (es solo para aprender), pero **es una excelente simulación** de lo que intentaría hacer un competidor malintencionado o un bug muy agresivo.

* **El escenario real:** En la vida real, no sería un fondo azul. Podría ser un script que intenta leer tus cookies de sesión, robar información de tu carrito o inyectar formularios de phishing.
* **La protección:** Por eso usamos Shadow DOM + `composed: true`. Si implementamos esto correctamente en los Web Components, el código malicioso de la página principal no podrá "ver" ni manipular los datos sensibles que están dentro de tu Micro-frontend.

**Respuesta final a tu pregunta:**
Sí, tu entendimiento es **perfecto**. El "Código Espantapájaros" es una herramienta pedagógica para forzar el uso de Shadow DOM, y tus conceptos de `CustomEvent` y `composed` son la clave técnica para que la comunicación funcione a través de las fronteras arquitectónicas que estamos diseñando.

¿Estás listo para pasar al **Hito Práctico 2.2**, donde usaremos Angular Elements para generar este componente automáticamente con Shadow DOM y enviar estos eventos de forma nativa, sin tener que escribir JavaScript "sucio" manualmente?

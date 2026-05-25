### 1. El DOM y el Shadow DOM

Imagina que una página web es un **árbol genealógico**. El **DOM** (Document Object Model) es simplemente la forma en que el navegador lee tu código HTML y lo convierte en ese árbol de elementos vivos en la memoria (donde el `<body>` es padre del `<h1>`, que a su vez es hermano del `<button>`).

El gran problema del DOM normal es que es **público y global**. Si un equipo escribe una regla CSS para los botones, afectará a *todos* los botones del árbol (como te pasó con el botón azul y feo de la prueba).

Aquí nace el **Shadow DOM** (DOM en la sombra). Piensa en él como una "habitación insonorizada" incrustada dentro de ese árbol.

* **Aislamiento total:** Lo que pasa en el Shadow DOM, se queda en el Shadow DOM. El CSS global del documento no puede entrar a ensuciar tu diseño, y tus estilos no pueden salir a romper el resto de la página.


* Por eso tu `<tractor-button>` mantuvo su color rojo.

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


## fase-2-web-components

¿Qué es Angular Elements y por qué lo necesitamos?
En el laboratorio anterior creamos un botón nativo (<tractor-button>). Tuvimos que usar document.createElement, escribir el CSS como un string de texto, e inyectar todo manualmente en el Shadow DOM. Imagina hacer esto para un carrito de compras entero... sería una pesadilla de mantener.

Aquí entra Angular Elements. Es una librería oficial que toma un componente moderno de Angular (con su HTML limpio, su SCSS y su lógica de TypeScript) y lo disfraza de Web Component estándar.
Para el navegador, será un simple <tractor-checkout>, pero por dentro, tendrá toda la potencia del motor de Angular 19. Así es como los micro-frontends del Tractor Store podrán incrustarse en cualquier lado.
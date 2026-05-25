import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { TsCartCounterComponent } from './app/ts-cart-counter/ts-cart-counter.component';

(async () => {
  // Inicializamos una aplicación Angular "sin cabeza" (headless)
  const app = await createApplication();

  // Convertimos el componente Angular en un Custom Element estándar [cite: 178, 188]
  const cartCounterElement = createCustomElement(TsCartCounterComponent, {
    injector: app.injector
  });

  // Registramos el tag en el navegador [cite: 188]
  customElements.define('ts-cart-counter', cartCounterElement);
})();
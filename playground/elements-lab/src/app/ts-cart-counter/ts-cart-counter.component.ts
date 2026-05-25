import { Component, input, output, ViewEncapsulation, HostListener, signal, effect } from '@angular/core';

@Component({
  selector: 'app-ts-cart-counter',
  standalone: true,
  // ¡CRÍTICO! Esto le dice a Angular que use Shadow DOM nativo 
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `
    <button (click)="onClick()">
      🛒 <span class="badge">{{ currentCount() }}</span>
    </button>
  `,
  styles: [`
    /* Usamos CSS Custom Properties para permitir que el exterior cambie el diseño [cite: 187] */
    button {
      background-color: var(--cart-counter-bg, #333);
      color: var(--cart-counter-color, white);
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: red;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
    }
  `]
})
export class TsCartCounterComponent {
  // Input y Output modernos de Angular 19
  // count es de solo lectura, por lo que usamos un estado interno "currentCount"
  count = input<number>(0);
  cartClick = output<void>();

  currentCount = signal(0);

  constructor() {
    // Sincroniza el valor inicial del input (atributo HTML) con el estado interno
    effect(() => {
      this.currentCount.set(Number(this.count()));
    });
  }

  onClick() {
    // Al hacer clic, emitimos el evento hacia afuera (Angular Elements lo convierte en CustomEvent)
    this.cartClick.emit();
  }

  // Escuchamos el evento global (window) disparado por otros micro-frontends
  @HostListener('window:checkout:cart-updated', ['$event'])
  onCartUpdated(event: CustomEvent) {
    console.log('[Angular Elements] Recibido evento global checkout:cart-updated', event.detail);

    if (event.detail && typeof event.detail.count === 'number') {
      this.currentCount.set(event.detail.count);
    } else {
      this.currentCount.update(c => c + 1);
    }
  }
}
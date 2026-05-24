// playground/native-button.ts

class TractorButton extends HTMLElement {
    constructor() {
        super(); // Siempre llamar a super() primero

        // 1. Adjuntamos el Shadow DOM (El escudo protector)
        // mode: 'open' permite que podamos inspeccionarlo en el navegador
        const shadow = this.attachShadow({ mode: 'open' });

        // 2. Creamos los elementos internos
        const button = document.createElement('button');
        // Leemos el atributo "label" del HTML (<tractor-button label="Comprar">)
        button.textContent = this.getAttribute('label') || 'Botón Base';

        // 3. Añadimos estilos ENCAPSULADOS
        // Estos estilos no saldrán de este componente, ni los estilos globales entrarán
        const style = document.createElement('style');
        style.textContent = `
      button {
        background-color: #d32f2f;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
      }
      button:hover {
        background-color: #b71c1c;
      }
    `;

        // 4. Conectamos los eventos
        button.addEventListener('click', () => {
            // Usamos el CustomEvent que practicamos en la Fase 1
            const event = new CustomEvent('tractor:button:clicked', {
                bubbles: true,
                composed: true // CRÍTICO: Permite que el evento atraviese el Shadow DOM
            });
            this.dispatchEvent(event);
            console.log('Evento despachado desde el Shadow DOM!');
        });

        // 5. Inyectamos el botón y el estilo dentro de nuestro Shadow DOM
        shadow.appendChild(style);
        shadow.appendChild(button);
    }
}

// Registramos nuestro nuevo tag en el navegador
customElements.define('tractor-button', TractorButton);
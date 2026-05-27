# Guía de Arquitectura y Aprendizaje: Fase 4 — Estilos y Design Tokens

Este documento sirve como registro técnico de la **Fase 4** del proyecto **Tractor Store**. Aquí detallamos las decisiones de arquitectura de estilos en nuestro monorepo (Nx + pnpm), la convivencia entre metodologías y cómo resolvimos la adopción temprana de la última tecnología.

---

## 1. Objetivos Cumplidos

- **Identidad Centralizada:** Creación del paquete agnóstico `packages/design-tokens` como única fuente de la verdad visual.
- **Aislamiento y Theming:** Comprensión de cómo el Shadow DOM bloquea clases tradicionales, y cómo las _CSS Custom Properties_ son la única vía nativa para inyectar temas en los Web Components.
- **Capa Utilitaria Vanguardista:** Integración nativa de **Tailwind CSS v4** prescindiendo de configuraciones de JavaScript obsoletas.
- **Fronteras Metodológicas:** Definición estricta de cuándo usar utilidades atómicas y cuándo aplicar metodologías estructuradas como BEM.

---

## 2. El Core Teórico: CSS Custom Properties vs. Shadow DOM

En nuestra arquitectura de Micro-Frontends, exportaremos componentes usando _Custom Elements_ (Web Components). Estos utilizan el **Shadow DOM** para encapsular su estructura y evitar que los estilos globales de la página los rompan.

### La Barrera del Shadow DOM

Si el Shell declara un estilo global (`button { background: red; }`), el Shadow DOM del componente lo bloqueará. Esto es intencional para proteger la integridad del componente.

### El "Superpoder" de las Variables CSS

Las **CSS Custom Properties (`--mi-variable`)** son el único mecanismo de estilos diseñado nativamente para atravesar el Shadow DOM.
Al declarar las variables en el `:root` del Shell, sus valores viajan hacia adentro de los componentes aislados. Por esto, los Design Tokens en CSS son el estándar de la industria para crear sistemas de _Theming_ (como un "Modo Oscuro") en arquitecturas distribuidas.

---

## 3. Arquitectura de Design Tokens en 3 Capas

Para evitar el desorden visual, estructuramos nuestros tokens en tres capas independientes:

| Capa              | Propósito                            | Ejemplo                                      | Regla de Uso                                     |
| :---------------- | :----------------------------------- | :------------------------------------------- | :----------------------------------------------- |
| **Primitivos**    | Paleta cruda estática. Sin contexto. | `--tractor-green-500: #22c55e;`              | Solo uso interno para alimentar otras variables. |
| **Semánticos**    | Definen el propósito en la interfaz. | `--color-primary: var(--tractor-green-500);` | Consumidos por Tailwind y aplicaciones globales. |
| **De Componente** | Extrema especificidad.               | `--ts-button-bg: var(--color-primary);`      | Uso exclusivo dentro de `ts-design-system`.      |

---

## 4. Evolución Tecnológica: Tailwind CSS v4

Durante el desarrollo, descubrimos que los esquemas de generación de Nx estaban desfasados respecto a la versión recién lanzada de Tailwind CSS (v4) instalada por `pnpm`.

En lugar de retroceder a la versión 3, actualizamos nuestra arquitectura al nuevo paradigma nativo:

1.  **Eliminación de JS:** Borramos `tailwind.config.js` y `tailwind-workspace-preset.js`.
2.  **Configuración Nativa:** Utilizamos el nuevo plugin de PostCSS (`@tailwindcss/postcss`).
3.  **Directiva `@theme`:** Inyectamos nuestros tokens directamente mediante CSS puro.

---

## 5. Implementación del Código (Hito del Tractor Store)

### Fuente de la Verdad (`packages/design-tokens/src/tokens.css`)

Utilizamos la nueva directiva `@theme` de Tailwind v4 para que genere clases automáticas basadas en nuestros tokens:

```css
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap');

@theme {
  /* Primitivos */
  --tractor-green-500: #22c55e;
  --tractor-gray-100: #f3f4f6;
  --tractor-gray-900: #111827;
  --spacing-8: 2rem;

  /* Semánticos (Tailwind los lee automáticamente) */
  --color-primary: var(--tractor-green-500);
  --color-surface: var(--tractor-gray-100);
  --font-family-base: 'Raleway', sans-serif;
  --spacing-container: var(--spacing-8);
}

:root {
  --color-text-base: var(--tractor-gray-900);
}
```

### Estilos Globales del Shell (`apps/shell/src/styles.scss`)

```scss
/* 1. Importamos los Design Tokens */
@import '../../../packages/design-tokens/src/tokens.css';

/* 2. Importamos el motor nativo de Tailwind v4 */
@import 'tailwindcss';

body {
  background-color: var(--color-surface);
  color: var(--color-text-base);
  font-family: var(--font-family-base);
  margin: 0;
  min-height: 100vh;
}
```

---

## 6. Convivencia Metodológica: Tailwind CSS vs. BEM

Para prevenir el "código espagueti" visual, definimos responsabilidades estrictas:

- **Tailwind CSS (Clases Atómicas):** Se utiliza exclusivamente para **Layout y Estructura Global**. (Grillas, flexbox, márgenes entre secciones, maquetación de las vistas del Shell y los Micro-frontends).
- **BEM (Block, Element, Modifier):** Se utiliza exclusivamente para los **Componentes del Design System (`ts-design-system`)**. Un botón, input o modal debe ser un componente limpio y robusto escrito en SCSS (ej. `.ts-button`, `.ts-button--disabled`), evitando saturar el HTML con decenas de utilidades de Tailwind.

---

## 7. Checklist de Validación

- [x] Entiendo por qué las CSS Custom Properties atraviesan el Shadow DOM y los estilos tradicionales no.
- [x] Puedo configurar un sistema de temas usando la directiva `@theme` de Tailwind v4.
- [x] Sé cuándo prefiero aplicar BEM (Componentes atómicos) y cuándo Tailwind (Layouts).

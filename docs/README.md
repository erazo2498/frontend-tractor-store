# 🚜 The Tractor Store — Centro de Documentación de Arquitectura

Bienvenido al repositorio de **The Tractor Store**, un ecosistema de e-commerce a gran escala implementado con una arquitectura moderna de **Micro-Frontends** (Angular 19 + Module Federation + Nx Monorepo) en el Frontend y un **Monolito Modular** (Spring Boot 3 + Spring Modulith) en el Backend.

---

## 🗺️ 1. División de Dominios (Equipos Autónomos)

El sistema se divide en tres verticales de negocio independientes, garantizando la autonomía de despliegue y desarrollo:

### 🔍 Team Explore (Descubrimiento)
* **Responsabilidad:** Atraer al usuario y guiarle en la búsqueda del tractor ideal.
* **Módulos:** Página de inicio (Home), listados de productos, filtros avanzados y recomendaciones personalizadas.
* **MFE:** `packages/mfe-explore` (Puerto `4203`).

### 🤝 Team Decide (Decisión)
* **Responsabilidad:** Convencer al usuario aportando detalle técnico y transparencia.
* **Módulos:** Página de detalle de producto (PDP), selector de variantes (potencia, accesorios, color) y validación de stock.
* **MFE:** `packages/mfe-decide` (Puerto `4202`).

### 🛒 Team Checkout (Transacción)
* **Responsabilidad:** Asegurar la conversión y el flujo de pago fluido.
* **Módulos:** Botón de "Añadir al carrito", carrito de compras flotante, formulario de checkout y pasarela de pago.
* **MFE:** `packages/mfe-checkout` (Puerto `4201`).

---

## 📚 2. Índice de Guías de Aprendizaje

Para un estudio profundo y ordenado de los conceptos técnicos aplicados en este proyecto, explora nuestras guías específicas por fases:

### 🧪 Conceptos Fundamentales (Fases 1 y 2)
*   **Web Components y Shadow DOM:** Aislamiento total de estilos y estructura ([Ver sección abajo](#-conceptos-clave-web-components)).
*   **Angular Elements:** Cómo empaquetar componentes de Angular como elementos HTML personalizados estándar.

### 📦 Monorepo, Tooling y Configuración (Fase 3)
*   [**pnpm Workspaces & Gestión de Dependencias** (docs/pnpm-workspaces-guide.md)](file:///home/quind/Proyects/quind/tractor-store/frontend-tractor-store/docs/pnpm-workspaces-guide.md)
    *   *Temas:* Resolución de dependencias locales vía Symlinks, seguridad de `.npmrc` en registros privados y el uso crítico del `--frozen-lockfile` en CI/CD.
*   [**Nx Tooling & Optimización** (docs/nx-tooling-guide.md)](file:///home/quind/Proyects/quind/tractor-store/frontend-tractor-store/docs/nx-tooling-guide.md)
    *   *Temas:* Ejecutores, generadores estandarizados, afinamiento de caché (`namedInputs` y `targetDefaults`), caching distribuido y ejecución inteligente con `nx affected`.
*   [**Arquitectura Física del Tractor Store** (docs/hito-tractor-store-architecture.md)](file:///home/quind/Proyects/quind/tractor-store/frontend-tractor-store/docs/hito-tractor-store-architecture.md)
    *   *Temas:* Mapeo de puertos, diagrama visual del grafo de dependencias del Tractor Store, límites de tags arquitectónicos y guía completa de comandos para superar el Hito.

---

## 🔬 Conceptos Clave: Web Components

Para que la comunicación entre nuestros micro-frontends se realice de forma segura, robusta e independiente de cualquier framework, dominamos la tecnología nativa de los **Web Components**:

### A. El DOM y el Shadow DOM
El **DOM (Document Object Model)** es el árbol jerárquico global de la página. Su gran debilidad es que es público y global: un estilo CSS invasivo en la raíz puede romper los estilos de tu componente.
El **Shadow DOM** actúa como una *"habitación insonorizada"* dentro de ese árbol:
*   **Aislamiento total:** Lo que pasa en el Shadow DOM se queda allí. El CSS global del documento no puede filtrarse para ensuciar tu diseño, ni tus estilos pueden escaparse a romper el resto de la interfaz.

### B. CustomEvent (El Mensajero con Mochila)
Los eventos tradicionales (`click`, `submit`) son genéricos. En una arquitectura MFE, los equipos necesitan compartir datos contextuales complejos (ej: al hacer clic en "Añadir al carrito", el Team Checkout necesita saber qué SKU y qué cantidad se seleccionó).
Un **`CustomEvent`** permite adjuntar una carga útil estructurada en su propiedad **`detail`**:
```javascript
const evento = new CustomEvent('carrito:actualizado', {
  detail: { sku: 'TRACTOR-XT500', cantidad: 1 }
});
```

### C. La propiedad `composed: true` (El Pasaporte VIP)
Debido a la naturaleza hermética del Shadow DOM, por defecto, cualquier evento nacido en su interior tiene prohibido traspasar la frontera hacia el DOM global.
Al instanciar el `CustomEvent`, configuramos la bandera `composed: true`:
*   Funciona como un **pasaporte diplomático** que le indica al navegador que permita al evento atravesar la barrera del Shadow DOM y ascender por el DOM normal. Así, otros micro-frontends en la página pueden escucharlo de forma descentralizada.

---

## 🛠️ 3. Configuración Inicial del Entorno

### Requisitos Previos: NVM (Node Version Manager)
Diferentes proyectos corporativos demandan diferentes versiones de Node.js. NVM permite conmutar entornos en un segundo y evita conflictos de versiones globales.

1.  **Cargar o instalar NVM:**
    Asegúrate de tener NVM instalado (`~/.nvm`).
2.  **Cargar Node v24 (Recomendado para Angular 19 en este monorepo):**
    ```bash
    nvm use 24
    ```

### Instalación de Dependencias
```bash
# 1. Aprobar la compilación segura de binarios de soporte (pnpm es estricto por seguridad)
pnpm approve-builds

# 2. Instalar el árbol de dependencias
pnpm install
```

---

## 🚀 4. Comandos de Operación Rápida

*   **Levantar el ecosistema completo (5 apps en paralelo sin colisiones):**
    ```bash
    pnpm exec nx run-many --target=serve --all
    ```
*   **Analizar el código y verificar reglas de fronteras de tags:**
    ```bash
    pnpm exec nx run-many --target=lint
    ```
*   **Compilar únicamente lo afectado por tus últimos commits:**
    ```bash
    pnpm exec nx affected --target=build --base=origin/main
    ```
*   **Ver el mapa interactivo del monorepo:**
    ```bash
    pnpm exec nx graph
    ```
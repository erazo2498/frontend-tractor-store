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
// ==========================================
// MÓDULOS: ESM vs CommonJS
// ==========================================
// Este archivo explica la diferencia entre los dos sistemas de módulos en JavaScript
// y por qué el ecosistema se está moviendo a ESM (EcmaScript Modules).
//
// Entender esto es clave porque:
// - Angular, Vite, y herramientas modernas asumen ESM
// - Node.js 20+ soporta ESM nativamente
// - Los bundlers optimizan mejor con ESM (tree-shaking)

// ==========================================
// 1. COMMONJS (CJS) — El formato original de Node.js (2009)
// ==========================================
// Sintaxis: require() para importar, module.exports para exportar.
// Era el único sistema de módulos en Node.js hasta hace poco.
//
// Características:
// - Carga SÍNCRONA: require() bloquea la ejecución hasta cargar el módulo
// - Carga DINÁMICA: puedes hacer require() dentro de un if
// - No soporta top-level await
// - package.json: "type": "commonjs" (o sin campo "type")
//
// Ejemplo (NO ejecutable en ESM, solo referencia):
// ─────────────────────────
// const express = require('express');        // importar
// const { readFile } = require('fs');        // importar destructurado
//
// function myFunction() { ... }
// module.exports = { myFunction };           // exportar objeto
// module.exports = myFunction;               // exportar directamente
// ─────────────────────────
//
// Problemas de CJS:
// 1. No es un estándar del lenguaje (es una convención de Node.js)
// 2. Los bundlers NO pueden hacer tree-shaking eficiente
//    (porque require() es dinámico, no saben qué se usa hasta runtime)
// 3. No soporta top-level await
// 4. La sintaxis module.exports es confusa (¿objeto o valor directo?)

// ==========================================
// 2. ESM (EcmaScript Modules) — El estándar oficial (ES2015+)
// ==========================================
// Sintaxis: import/export (lo que usamos aquí).
// Es parte del estándar del lenguaje JavaScript, no una convención de Node.
//
// Características:
// - Carga ESTÁTICA: los imports se resuelven ANTES de ejecutar el código
// - El bundler puede analizar el árbol de dependencias completo
// - Soporta top-level await
// - package.json: "type": "module"
//
// Tipos de export:

// Named exports — puedes exportar múltiples valores con nombre
export const STORE_NAME = 'Tractor Store';
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Default export — un solo valor principal por módulo
// export default class ProductService { ... }
//
// Re-export — reexportar desde otro módulo (útil para barrel files / index.ts)
// export { Product, Variant } from './domain';
// export * from './domain'; // reexporta todo

// ==========================================
// 3. IMPORTACIÓN: Diferencias clave
// ==========================================
//
// ESM (lo que usas en este proyecto):
// ─────────────────────────
// import { Product } from './domain';           // named import
// import * as Domain from './domain';            // namespace import
// import ProductService from './product.service'; // default import
// import { Product as Producto } from './domain'; // renombrar
// ─────────────────────────
//
// CJS (legacy):
// ─────────────────────────
// const { Product } = require('./domain');       // destructuring
// const Domain = require('./domain');             // todo el módulo
// ─────────────────────────

// ==========================================
// 4. TOP-LEVEL AWAIT — Solo disponible en ESM
// ==========================================
// En CJS, await solo funciona dentro de funciones async.
// En ESM, puedes usar await directamente en el nivel superior del módulo.
//
// Esto simplifica la inicialización de módulos que dependen de datos async:
//
// const config = await fetch('/api/config').then(r => r.json());
// const db = await connectToDatabase(config.dbUrl);
//
// Sin top-level await (CJS), tendrías que envolver todo en una IIFE async:
// (async () => {
//   const config = await fetch(...);
//   // ... todo tu código aquí dentro
// })();

// ==========================================
// 5. TREE-SHAKING — Por qué ESM es superior para bundles
// ==========================================
// Tree-shaking = eliminar código muerto (funciones que nadie usa).
//
// ESM: Como los imports son ESTÁTICOS, el bundler sabe en tiempo de build
// exactamente qué funciones se importan y puede eliminar el resto.
//
// CJS: Como require() es DINÁMICO (puede estar en un if, en un loop, etc.),
// el bundler NO puede saber con certeza qué se usa y debe incluir TODO.
//
// Ejemplo:
// ─────────────────────────
// // libreria-grande.ts exporta 100 funciones
// import { soloUnaFuncion } from 'libreria-grande';
//
// ESM: el bundler incluye SOLO soloUnaFuncion (y sus dependencias)
// CJS: el bundler incluye TODAS las 100 funciones por si acaso
// ─────────────────────────
//
// Impacto: bundles más pequeños → páginas que cargan más rápido → mejor UX

// ==========================================
// 6. DYNAMIC IMPORT — Lo mejor de ambos mundos
// ==========================================
// ESM también soporta imports dinámicos con import() (función, no keyword).
// A diferencia de require(), import() devuelve una PROMESA.
// Esto es la base del lazy loading en Angular:

async function loadCheckoutModule() {
  // El módulo se descarga SOLO cuando el usuario llega a /checkout
  // Angular Router usa exactamente esto para loadChildren
  const module = await import('./domain');
  console.log('Módulo cargado dinámicamente:', module);
}

// ==========================================
// 7. ¿CÓMO SABE NODE QUÉ SISTEMA USAR?
// ==========================================
//
// Node.js decide según estos criterios (en orden de prioridad):
//
// 1. Extensión del archivo:
//    - .mjs → SIEMPRE ESM
//    - .cjs → SIEMPRE CJS
//    - .js  → depende de package.json
//
// 2. Campo "type" en package.json:
//    - "type": "module"    → todos los .js son ESM
//    - "type": "commonjs"  → todos los .js son CJS (default)
//
// En NUESTRO package.json tenemos "type": "module" → usamos ESM.

// ==========================================
// 8. RESUMEN: ¿POR QUÉ MIGRAR A ESM?
// ==========================================
//
// | Característica          | CommonJS           | ESM                    |
// |-------------------------|--------------------|------------------------|
// | Estándar                | De facto (Node)    | Del lenguaje (TC39)    |
// | Carga                   | Síncrona           | Estática + async       |
// | Tree-shaking            | ❌ Limitado         | ✅ Completo            |
// | Top-level await         | ❌ No               | ✅ Sí                  |
// | Análisis estático       | ❌ Difícil          | ✅ Total               |
// | Soporte navegadores     | ❌ Necesita bundler | ✅ Nativo              |
// | Angular / Vite / Next   | ❌ No recomendado   | ✅ Asumido por defecto |
//
// Conclusión: ESM es el presente y futuro. CJS se mantiene por retrocompatibilidad.

export { loadCheckoutModule };

// ==========================================
// UTILITY TYPES — TypeScript Built-in Types
// ==========================================
// TypeScript incluye "utility types" que transforman tipos existentes.
// Son funciones a nivel de tipos: reciben un tipo y devuelven otro tipo.
// Dominarlos evita duplicar interfaces y mantiene el código DRY.

import { Product, Variant, Cart, LineItem, Result } from './domain';

// ==========================================
// 1. PARTIAL<T> — Hace TODAS las propiedades opcionales
// ==========================================
// Caso de uso: funciones de actualización parcial (PATCH en REST).
// No necesitas enviar todo el Product, solo los campos que cambiaron.
//
// Equivale a:
// {
//   id?: string;
//   name?: string;
//   description?: string;
//   category?: 'tractors' | 'accessories';
// }
type ProductUpdate = Partial<Product>;

// Ejemplo práctico: una función que actualiza un producto
function updateProduct(id: string, changes: ProductUpdate): Result<Product> {
  // Solo los campos presentes en 'changes' se actualizan
  console.log(`Actualizando producto ${id} con:`, changes);
  // En un caso real, harías un merge con el producto existente
  return { success: true, data: { id, name: '', description: '', category: 'tractors', ...changes } };
}

// Uso: solo paso el campo que cambió
// updateProduct('prod-1', { name: 'Nuevo nombre' });

// ==========================================
// 2. REQUIRED<T> — Hace TODAS las propiedades obligatorias
// ==========================================
// Caso de uso: forzar que campos opcionales estén presentes.
// Variant.attributes tiene campos opcionales (color?, enginePower?).
// Cuando mostramos la ficha completa, queremos asegurar que todo está.
//
// Equivale a:
// {
//   color: string;        ← ya no es opcional
//   enginePower: string;   ← ya no es opcional
// }
type CompleteAttributes = Required<Variant['attributes']>;

// Ejemplo: una función de validación que exige todos los atributos
function validateCompleteVariant(attrs: CompleteAttributes): boolean {
  // Aquí TS nos obliga a que color y enginePower existan (no undefined)
  return attrs.color.length > 0 && attrs.enginePower.length > 0;
}

// ==========================================
// 3. PICK<T, Keys> — Escoge SOLO algunas propiedades
// ==========================================
// Caso de uso: crear un tipo más ligero para listados o resúmenes.
// En un listado de productos no necesitas la descripción completa.
//
// Equivale a:
// {
//   id: string;
//   name: string;
//   category: 'tractors' | 'accessories';
// }
type ProductSummary = Pick<Product, 'id' | 'name' | 'category'>;

// Ya lo usas en domain.ts para CartItemBase = Pick<Variant, 'id' | 'productId' | 'price' | 'sku'>

// ==========================================
// 4. OMIT<T, Keys> — Excluye propiedades
// ==========================================
// Caso de uso: crear objetos sin el ID (para creación via POST).
// El servidor genera el ID, así que al enviar datos nuevos no lo incluimos.
//
// Equivale a:
// {
//   name: string;
//   description: string;
//   category: 'tractors' | 'accessories';
// }
type NewProduct = Omit<Product, 'id'>;

// Ejemplo: función de creación que no requiere ID
function createProduct(data: NewProduct): Result<Product> {
  const newProduct: Product = {
    id: crypto.randomUUID(), // El servidor genera el ID
    ...data,
  };
  return { success: true, data: newProduct };
}

// ==========================================
// PICK vs OMIT — ¿Cuándo usar cada uno?
// ==========================================
// Pick = "quiero SOLO estos campos" → cuando necesitas pocos campos de un tipo grande
// Omit = "quiero TODO EXCEPTO estos" → cuando necesitas casi todo menos unos pocos campos
//
// Regla práctica: si estás listando más de la mitad de las propiedades en Pick,
// probablemente Omit sea más limpio (y viceversa).

// ==========================================
// 5. RECORD<Keys, Type> — Crear mapas/diccionarios tipados
// ==========================================
// Caso de uso: indexar datos por clave de forma segura.
// Record<K, V> crea un tipo cuyas keys son K y cuyos valores son V.
//
// Equivale a:
// {
//   [key: string]: Product
// }
// pero con el beneficio de que puedes restringir las keys.

// Mapa de productos indexado por ID
type ProductCatalog = Record<string, Product>;

// Mapa de stock por ID de variante
type StockByVariantId = Record<Variant['id'], number>;

// Record con keys específicas (literal union)
type TeamDescriptions = Record<'explore' | 'decide' | 'checkout', string>;

// Ejemplo:
const teamDescriptions: TeamDescriptions = {
  explore: 'Descubrimiento de productos',
  decide: 'Decisión de compra',
  checkout: 'Proceso de pago',
  // auth: 'Login' ← Error: 'auth' no es una key válida
};

// ==========================================
// 6. RETURNTYPE<T> — Extraer el tipo de retorno de una función
// ==========================================
// Caso de uso: cuando no quieres (o no puedes) exportar un tipo explícito,
// pero sí quieres reusar lo que una función devuelve.

function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ReturnType extrae el tipo que la función devuelve
type TotalResult = ReturnType<typeof calculateTotal>; // number

// Uso más avanzado: extraer el tipo de retorno de una función de terceros
// type ApiResponse = ReturnType<typeof thirdPartyLib.fetchData>;
// Así no dependes de que la librería exporte el tipo.

// ==========================================
// 7. PARAMETERS<T> — Extraer los tipos de los parámetros de una función
// ==========================================
// Caso de uso: crear wrappers o decoradores que acepten los mismos argumentos.

type CalculateTotalParams = Parameters<typeof calculateTotal>;
// Resultado: [items: { price: number; quantity: number }[]]
// Es una TUPLA con los tipos de cada parámetro.

// Ejemplo práctico: un wrapper que loguea antes de ejecutar
function withLogging(
  ...args: Parameters<typeof calculateTotal>
): ReturnType<typeof calculateTotal> {
  console.log('[LOG] Calculando total con', args[0].length, 'items');
  return calculateTotal(...args);
}

// ==========================================
// 8. READONLY<T> — Hacer todas las propiedades de solo lectura
// ==========================================
// Caso de uso: prevenir mutaciones accidentales en datos que no deberían cambiar.
// Similar a Object.freeze() pero a nivel de tipos (compile-time).
type FrozenCart = Readonly<Cart>;

// Ejemplo:
// const cart: FrozenCart = { id: '1', items: [], total: 0 };
// cart.total = 100; ← Error: Cannot assign to 'total' because it is a read-only property

// ==========================================
// 9. EXCLUDE<Union, Excluded> — Excluir miembros de una unión
// ==========================================
// A diferencia de Omit (que trabaja con propiedades de objetos),
// Exclude trabaja con UNIONES de tipos.
type AllCategories = 'tractors' | 'accessories' | 'parts' | 'services';
type PhysicalCategories = Exclude<AllCategories, 'services'>;
// Resultado: 'tractors' | 'accessories' | 'parts'

// ==========================================
// 10. EXTRACT<Union, Extracted> — Extraer miembros de una unión
// ==========================================
// Lo opuesto de Exclude: conserva solo los miembros que coinciden.
type ShippableCategories = Extract<AllCategories, 'tractors' | 'parts'>;
// Resultado: 'tractors' | 'parts'

// ==========================================
// 11. NONNULLABLE<T> — Eliminar null y undefined de un tipo
// ==========================================
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// Resultado: string

// Caso de uso: después de un null-check, el tipo ya está "limpio"
function processName(name: MaybeString): void {
  if (name != null) {
    // Aquí TypeScript ya sabe que name es string (NonNullable<MaybeString>)
    console.log(name.toUpperCase());
  }
}

// ==========================================
// RESUMEN: Tabla de referencia rápida
// ==========================================
//
// | Utility Type      | Qué hace                                   | Ejemplo de uso                    |
// |-------------------|--------------------------------------------|-----------------------------------|
// | Partial<T>        | Todo opcional                               | Updates parciales (PATCH)         |
// | Required<T>       | Todo obligatorio                           | Validación completa               |
// | Pick<T, K>        | Solo estas propiedades                     | Resúmenes, listados               |
// | Omit<T, K>        | Todo excepto estas                         | Crear sin ID (POST)               |
// | Record<K, V>      | Mapa/diccionario tipado                    | Catálogos, índices                |
// | ReturnType<F>     | Tipo de retorno de función                 | Reusar tipos de funciones         |
// | Parameters<F>     | Tipos de parámetros de función             | Wrappers, decoradores             |
// | Readonly<T>       | Todo de solo lectura                       | Datos inmutables                  |
// | Exclude<U, E>     | Quitar de una unión                        | Filtrar categorías                |
// | Extract<U, E>     | Quedarse con miembros de una unión         | Seleccionar subconjuntos          |
// | NonNullable<T>    | Quitar null y undefined                    | Después de null-checks            |

export type {
  ProductUpdate,
  CompleteAttributes,
  ProductSummary,
  NewProduct,
  ProductCatalog,
  StockByVariantId,
  TeamDescriptions,
  TotalResult,
  CalculateTotalParams,
  FrozenCart,
  PhysicalCategories,
  ShippableCategories,
  DefiniteString,
};

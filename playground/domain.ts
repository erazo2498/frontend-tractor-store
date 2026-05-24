// ==========================================
// MODELOS DE DOMINIO — Tractor Store
// ==========================================
// Estos modelos representan las entidades centrales del negocio.
// Son la "fuente de verdad" que todos los equipos (Explore, Decide, Checkout) comparten.
//
// Convenciones:
// - readonly en campos que NUNCA deberían mutar después de crear el objeto.
//   Esto es una guarda a nivel de tipos (compile-time), similar a Object.freeze()
//   pero sin costo en runtime. Si alguien intenta hacer product.id = 'x', TS dará error.
// - Interfaces para los modelos (pueden ser extendidas/implementadas por clases).
// - Types para derivaciones con utility types.

// ==========================================
// 1. Entidades Base del Catálogo
// ==========================================

/**
 * Producto del catálogo del Tractor Store.
 * Representa un modelo de tractor o accesorio, sin considerar variantes específicas.
 * Ejemplo: "Tractor Fendt 1050 Vario" (sin color ni potencia específica).
 */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'tractors' | 'accessories';
}

/**
 * Variante específica de un producto.
 * Un Product puede tener múltiples Variants (diferente color, potencia, etc.).
 * Ejemplo: "Fendt 1050 Vario — Verde, 500CV" con SKU y precio propios.
 */
export interface Variant {
  readonly id: string;
  readonly productId: string;  // FK → Product.id
  readonly sku: string;        // Stock Keeping Unit: código único de inventario
  readonly price: number;      // Precio en centavos (evita decimales con float)
  stock: number;               // Mutable: el stock cambia con cada venta
  readonly attributes: {
    color?: string;
    enginePower?: string;
  };
}

// ==========================================
// 2. Uso de Utility Types (Pick para derivar tipos)
// ==========================================
// "Escogemos" (Pick) solo las propiedades que el Carrito necesita saber de la Variante.
// ¿Por qué no usar Variant directamente? Porque el carrito no necesita saber el stock
// ni los atributos — mantener tipos ajustados reduce errores y acoplamientos.
export type CartItemBase = Pick<Variant, 'id' | 'productId' | 'price' | 'sku'>;

/**
 * Item dentro del carrito: una variante + su cantidad.
 * Extiende CartItemBase (que es un subconjunto de Variant) añadiendo quantity.
 */
export interface LineItem extends CartItemBase {
  quantity: number;
}

/**
 * Carrito de compras del Tractor Store.
 * Gestionado por Team Checkout.
 */
export interface Cart {
  readonly id: string;
  items: LineItem[];           // Mutable: se agregan/quitan items
  total: number;               // Mutable: se recalcula
}

// ==========================================
// 3. Entidad Store (Tienda)
// ==========================================
// La guía pide explícitamente este modelo.
// Representa la tienda completa con su catálogo y los equipos que la gestionan.

/** Nombres de los equipos autónomos que gestionan el micro-frontend */
export type TeamName = 'explore' | 'decide' | 'checkout';

/**
 * Configuración de la tienda.
 * Centraliza los productos disponibles y los equipos que gestionan cada parte.
 */
export interface Store {
  readonly id: string;
  readonly name: string;
  readonly teams: TeamName[];       // Equipos autónomos activos
  products: Product[];              // Catálogo de productos
}

// ==========================================
// 4. Tipo Genérico Result<T, E> para Manejo de Errores
// ==========================================
// En lugar de abusar de try/catch (que puede esconder errores o no ser tipado),
// devolvemos un Resultado predecible — esto se llama "Discriminated Union"
// (unión discriminada) porque el campo 'success' permite a TS saber exactamente
// qué propiedades tiene el objeto.
//
// ¿Cómo funciona la discriminación?
// if (result.success) {
//   result.data   ← TS sabe que existe (rama true)
//   result.error  ← TS marca error (no existe en la rama true)
// } else {
//   result.error  ← TS sabe que existe (rama false)
//   result.data   ← TS marca error (no existe en la rama false)
// }
//
// El genérico E = Error establece un "default type parameter":
// si no pasas E, asume que el error es de tipo Error.
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// ==========================================
// 5. Ejemplos de uso de Result<T, E>
// ==========================================

/** Función de ejemplo: agregar un item al carrito */
function addToCart(cart: Cart, item: LineItem): Result<Cart, string> {
  if (item.quantity <= 0) {
    return { success: false, error: 'La cantidad debe ser mayor a 0' };
  }

  const updatedItems = [...cart.items, item];
  const updatedTotal = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    success: true,
    data: { ...cart, items: updatedItems, total: updatedTotal },
  };
}

/** Ejemplo de cómo consumir el Result con type narrowing */
function handleAddToCart(cart: Cart, item: LineItem): void {
  const result = addToCart(cart, item);

  if (result.success) {
    // TypeScript sabe que aquí existe result.data (tipo Cart)
    console.log(`Carrito actualizado. Total: ${result.data.total}`);
  } else {
    // TypeScript sabe que aquí existe result.error (tipo string)
    console.error(`Error: ${result.error}`);
  }
}
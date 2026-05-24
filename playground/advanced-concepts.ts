import { Product, Variant, Cart, Result, TeamName } from './domain';

// ==========================================
// 1. GENÉRICOS CON RESTRICCIONES (extends)
// ==========================================
// <T extends X> restringe T a tipos que tengan al menos lo que X tiene.

/** Extrae IDs de cualquier array de objetos con campo 'id' */
function extractIds<T extends { id: string }>(items: T[]): string[] {
  return items.map(item => item.id);
}

/** Busca por nombre en cualquier colección con id + name */
function findByName<T extends { id: string; name: string }>(
  items: T[],
  searchName: string
): T | undefined {
  return items.find(item =>
    item.name.toLowerCase().includes(searchName.toLowerCase())
  );
}

/** Respuestas paginadas — genérico con valor por defecto */
interface PaginatedResponse<T, Meta = { page: number; total: number }> {
  data: T[];
  metadata: Meta;
}

// ==========================================
// 2. DECORADORES (La base de @Component en Angular)
// ==========================================
// Un decorador es una FUNCIÓN que recibe una clase y la modifica/anota.
// Angular: @Component({ selector, template }) → registra el componente.
// @Injectable({ providedIn: 'root' }) → registra un servicio singleton.

interface ComponentOptions {
  selector: string;
  template?: string;
}

// Decorator factory con tipado correcto (evita Function genérico)
function UIComponent(options: ComponentOptions) {
  return function <T extends new (...args: any[]) => object>(constructor: T) {
    constructor.prototype.__metadata = options;
    console.log(`[Registro] Componente <${options.selector}> registrado`);
    return constructor;
  };
}

@UIComponent({ selector: 'tractor-store-button', template: '<button>Comprar</button>' })
class StoreButton {
  label = 'Añadir al carrito';
}

// Method Decorator: loguea cada llamada a un método
function Log(_target: object, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`[LOG] ${propertyKey} llamado con:`, args);
    const result = original.apply(this, args);
    console.log(`[LOG] ${propertyKey} retornó:`, result);
    return result;
  };
  return descriptor;
}

class CartService {
  @Log
  calculateTotal(items: { price: number; quantity: number }[]): number {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
}

// ==========================================
// 3. PROXY Y REFLECT (Base de la Reactividad / Signals)
// ==========================================
// Proxy intercepta operaciones sobre objetos (get, set).
// Reflect ejecuta la operación original de forma segura.

interface AppState { cartCount: number; userName: string }
const state: AppState = { cartCount: 0, userName: 'Anónimo' };

type Subscriber = (prop: string, value: unknown) => void;
const subscribers: Subscriber[] = [];

const reactiveState = new Proxy(state, {
  get(target, property, receiver) {
    console.log(`[Proxy:get] Leyendo ${String(property)}`);
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    const oldValue = Reflect.get(target, property, receiver);
    if (oldValue !== value) {
      console.log(`[Proxy:set] ${String(property)}: ${oldValue} → ${value}`);
      subscribers.forEach(fn => fn(String(property), value));
    }
    return Reflect.set(target, property, value, receiver);
  }
});

// Angular Signals usan un concepto similar:
// const count = signal(0);  → estado reactivo
// count.set(5);             → detecta cambio
// count();                  → registra dependencia

reactiveState.cartCount = 1;

// ==========================================
// 4. CUSTOM EVENTS (Comunicación Micro-Frontends)
// ==========================================
// Event: sin datos. CustomEvent: con datos en .detail
// bubbles: true → sube por el DOM. composed: true → atraviesa Shadow DOM.

interface TractorStoreEvents {
  'tractor:cart:add': { variantId: string; quantity: number };
  'tractor:cart:remove': { variantId: string };
  'tractor:product:viewed': { productId: string; teamOrigin: TeamName };
}

/** Dispara un Custom Event tipado */
function dispatchTractorEvent<K extends keyof TractorStoreEvents>(
  eventName: K,
  detail: TractorStoreEvents[K],
  target: EventTarget = document
): void {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,   // Sube por el DOM
    composed: true,  // Atraviesa Shadow DOM
  });
  target.dispatchEvent(event);
}

// ==========================================
// 5. TEMPLATE LITERAL TYPES
// ==========================================
type MicroFrontendEvent = `tractor:${TeamName}:${string}`;
const validEvent: MicroFrontendEvent = 'tractor:checkout:payment-success';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiVersion = 'v1' | 'v2';
type ApiEndpoint = `/${ApiVersion}/products` | `/${ApiVersion}/cart`;

type UpperTeam = Uppercase<TeamName>;   // 'EXPLORE' | 'DECIDE' | 'CHECKOUT'
type CapTeam = Capitalize<TeamName>;    // 'Explore' | 'Decide' | 'Checkout'

// ==========================================
// 6. TIPOS CONDICIONALES E INFER
// ==========================================
// T extends U ? X : Y → "Si T es compatible con U, tipo es X; si no, Y"
// infer: extrae un subtipo dentro de la condición.

type IsArray<T> = T extends any[] ? true : false;
// IsArray<string[]> = true,  IsArray<number> = false

type ElementOf<T> = T extends (infer E)[] ? E : never;
// ElementOf<Product[]> = Product,  ElementOf<string> = never

/** Extrae el tipo de datos exitoso de un Result<T, E> */
type UnwrapResult<R> = R extends { success: true; data: infer D } ? D : never;
type CartData = UnwrapResult<Result<Cart>>; // Cart

/** Extrae el tipo de error de un Result<T, E> */
type UnwrapError<R> = R extends { success: false; error: infer E } ? E : never;
type DefaultError = UnwrapError<Result<Cart>>;        // Error
type StringError = UnwrapError<Result<Cart, string>>; // string

/** Extrae el primer argumento de cualquier función */
type FirstArg<F> = F extends (arg: infer A, ...args: any[]) => any ? A : never;

// Tipos condicionales distributivos: se aplican a cada miembro de la unión
type ToArray<T> = T extends any ? T[] : never;
type Distributed = ToArray<string | number>; // string[] | number[]

// ==========================================
// 7. SINTAXIS ES2024 — JavaScript moderno
// ==========================================

// Optional Chaining (?.) → acceso seguro a propiedades anidadas
function getVariantColor(variant: Variant | null | undefined): string | undefined {
  return variant?.attributes?.color; // null → undefined, no TypeError
}

// Nullish Coalescing (??) → default SOLO si null/undefined (respeta 0, '', false)
function getStock(variant: Variant | null): number {
  // || incorrecto: variant?.stock || 10  ← si stock=0, devuelve 10 (BUG)
  // ?? correcto:
  return variant?.stock ?? 0;
}

// Nullish Assignment (??=) → asigna solo si null/undefined
function ensureDefaults(variant: Partial<Variant>): void {
  variant.stock ??= 0;
}

// Object.hasOwn() → reemplaza obj.hasOwnProperty() (más seguro)
function hasAttribute(variant: Variant, key: string): boolean {
  return Object.hasOwn(variant.attributes, key);
}

// Array.at() → índice negativo para acceso desde el final
function getLastItem(cart: Cart) {
  return cart.items.at(-1); // Último elemento
}

// structuredClone() → clon profundo (mejor que JSON.parse/stringify)
function cloneCart(cart: Cart): Cart {
  return structuredClone(cart);
}

export {
  extractIds, findByName, StoreButton, CartService,
  reactiveState, dispatchTractorEvent,
  getVariantColor, getStock, getLastItem, cloneCart,
};
export type {
  PaginatedResponse, TractorStoreEvents, MicroFrontendEvent,
  IsArray, ElementOf, UnwrapResult, UnwrapError, FirstArg,
};
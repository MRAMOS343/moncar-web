/**
 * Constantes de límites de validación para toda la aplicación
 * 
 * Centraliza todos los valores mágicos para facilitar mantenimiento
 * y garantizar consistencia en validaciones
 */

export const LIMITS = {
  // Productos
  PRODUCT: {
    NOMBRE_MIN: 1,
    NOMBRE_MAX: 200,
    SKU_MIN: 1,
    SKU_MAX: 50,
    MARCA_MIN: 1,
    MARCA_MAX: 100,
    PRECIO_MIN: 0.01,
    PRECIO_MAX: 999999.99,
    IVA_MIN: 0,
    IVA_MAX: 100,
    REORDER_MIN: 0,
    REORDER_MAX: 9999,
    SAFETY_STOCK_MIN: 0,
    SAFETY_STOCK_MAX: 9999,
    DESCRIPCION_MAX: 500,
  },

  // Ventas
  SALE: {
    QUANTITY_MIN: 1,
    QUANTITY_MAX: 9999,
    DISCOUNT_MIN: 0,
    DISCOUNT_MAX: 100,
    ITEMS_MIN: 1,
    ITEMS_MAX: 100,
    CLIENTE_MAX: 100,
  },

  // Inventario
  INVENTORY: {
    ON_HAND_MIN: 0,
    ON_HAND_MAX: 999999,
    RESERVED_MIN: 0,
    RESERVED_MAX: 999999,
  },

  // Tickets
  TICKET: {
    TITULO_MIN: 5,
    TITULO_MAX: 100,
    DESCRIPCION_MIN: 10,
    DESCRIPCION_MAX: 500,
  },

  // Búsqueda
  SEARCH: {
    RESULTS_INITIAL: 5,
    RESULTS_MAX: 50,
    QUERY_MIN: 1,
    QUERY_MAX: 100,
  },

  // Logger
  LOGGER: {
    MAX_LOGS: 100,
  },
} as const;

export type LimitCategory = keyof typeof LIMITS;

import { mockProducts } from '@/data/mockData';
import { Product } from '@/types';
import { logger } from './logger';

// Type guard para verificar si un objeto es un Product válido
export function isValidProduct(product: any): product is Product {
  return (
    product &&
    typeof product === 'object' &&
    typeof product.id === 'string' &&
    typeof product.nombre === 'string' &&
    typeof product.precio === 'number'
  );
}

// Obtener producto de forma segura con fallback
export function getProductByIdSafe(productId: string): Product | null {
  try {
    const product = mockProducts.find(p => p.id === productId);
    
    if (!product) {
      logger.warn(`Producto no encontrado: ${productId}`);
      return null;
    }
    
    if (!isValidProduct(product)) {
      logger.error(`Producto con datos inválidos: ${productId}`, { product });
      return null;
    }
    
    return product;
  } catch (error) {
    logger.error(`Error al obtener producto ${productId}:`, error);
    return null;
  }
}

// Obtener producto con valor por defecto
export function getProductByIdOrDefault(
  productId: string,
  defaultProduct: Partial<Product> = {}
): Product {
  const product = getProductByIdSafe(productId);
  
  if (product) {
    return product;
  }
  
  // Retornar producto por defecto si no se encuentra
  return {
    id: productId,
    sku: 'UNKNOWN',
    nombre: 'Producto no encontrado',
    marca: 'N/A',
    categoria: 'Motor',
    unidad: 'pza',
    precio: 0,
    iva: 16,
    reorderPoint: 0,
    safetyStock: 0,
    ...defaultProduct,
  } as Product;
}

// Verificar si un array tiene elementos
export function hasItems<T>(array: T[] | null | undefined): array is T[] {
  return Array.isArray(array) && array.length > 0;
}

// Obtener valor seguro de un objeto con path
export function safeGet<T>(
  obj: any,
  path: string,
  defaultValue: T
): T {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  } catch (error) {
    logger.warn(`Error al acceder a la propiedad ${path}:`, error);
    return defaultValue;
  }
}

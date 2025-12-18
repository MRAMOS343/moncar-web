import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';

/**
 * Hook optimizado para obtener información de productos
 * Usa un Map interno para lookups O(1)
 */
export function useProductCache() {
  const { products } = useData();

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach(product => {
      map.set(product.id, product);
    });
    return map;
  }, [products]);

  const getProductName = (productId: string): string => {
    const product = productMap.get(productId);
    return product ? `${product.nombre} - ${product.marca}` : 'Producto no encontrado';
  };

  const getProductById = (productId: string) => {
    return productMap.get(productId);
  };

  return {
    products,
    productMap,
    getProductName,
    getProductById,
  };
}

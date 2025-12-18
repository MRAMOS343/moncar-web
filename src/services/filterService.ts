import { Sale, Inventory, Product } from '@/types';

/**
 * Servicio para lógica de filtrado reutilizable
 */
export const filterService = {
  /**
   * Filtra ventas por sucursal y fechas
   */
  filterSalesByWarehouse(
    sales: Sale[], 
    warehouseId: string
  ): Sale[] {
    return warehouseId === 'all' 
      ? sales 
      : sales.filter(sale => sale.warehouseId === warehouseId);
  },

  /**
   * Filtra ventas por método de pago
   */
  filterSalesByPaymentMethod(
    sales: Sale[], 
    metodoPago: string
  ): Sale[] {
    return metodoPago && metodoPago !== 'all' 
      ? sales.filter(sale => sale.metodoPago === metodoPago)
      : sales;
  },

  /**
   * Filtra inventario por sucursal
   */
  filterInventoryByWarehouse(
    inventory: Inventory[], 
    warehouseId: string
  ): Inventory[] {
    return warehouseId === 'all'
      ? inventory
      : inventory.filter(inv => inv.warehouseId === warehouseId);
  },

  /**
   * Filtra productos por búsqueda de texto
   */
  filterProductsBySearch(
    products: Product[], 
    searchQuery: string
  ): Product[] {
    if (!searchQuery) return products;
    
    const searchLower = searchQuery.toLowerCase();
    return products.filter(product =>
      product.nombre.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.marca.toLowerCase().includes(searchLower)
    );
  },

  /**
   * Filtra productos por marca
   */
  filterProductsByBrand(
    products: Product[], 
    marca: string
  ): Product[] {
    return marca !== 'all' 
      ? products.filter(p => p.marca === marca)
      : products;
  },

  /**
   * Filtra productos por categoría
   */
  filterProductsByCategory(
    products: Product[], 
    categoria: string
  ): Product[] {
    return categoria !== 'all' 
      ? products.filter(p => p.categoria === categoria)
      : products;
  },

  /**
   * Obtiene marcas únicas de productos
   */
  getUniqueBrands(products: Product[]): string[] {
    return [...new Set(products.map(p => p.marca))];
  },

  /**
   * Obtiene categorías únicas de productos
   */
  getUniqueCategories(products: Product[]): string[] {
    return [...new Set(products.map(p => p.categoria))];
  }
};

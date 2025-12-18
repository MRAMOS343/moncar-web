import { Sale, Inventory, Product, KPIData } from '@/types';

/**
 * Servicio para cálculos de KPIs reutilizables
 */
export const kpiService = {
  /**
   * Calcula KPIs globales del negocio
   */
  calculateGlobalKPIs(sales: Sale[], inventory: Inventory[], products: Product[]): KPIData[] {
    const ventasTotales = sales.reduce((suma, venta) => suma + venta.total, 0);
    const totalProductos = products.length;
    const productosStockBajo = inventory.filter(inv => inv.onHand <= 10).length;
    const ticketPromedio = sales.length > 0 ? ventasTotales / sales.length : 0;

    return [
      {
        label: "Ventas Totales",
        value: ventasTotales,
        format: "currency",
        change: 12.5,
        changeType: "positive"
      },
      {
        label: "Productos Únicos",
        value: totalProductos,
        format: "number",
        change: 2.1,
        changeType: "positive"
      },
      {
        label: "Ticket Promedio",
        value: ticketPromedio,
        format: "currency",
        change: -1.2,
        changeType: "negative"
      },
      {
        label: "Stock Bajo",
        value: productosStockBajo,
        format: "number",
        change: 5.3,
        changeType: "negative"
      }
    ];
  },

  /**
   * Calcula KPIs de inventario
   */
  calculateInventoryKPIs(inventory: { onHand: number; product: Product }[]): KPIData[] {
    const lowStockItems = inventory.filter(inv => inv.onHand <= inv.product.reorderPoint).length;
    const totalStockValue = inventory.reduce((sum, inv) => sum + (inv.onHand * inv.product.precio), 0);
    const totalItems = inventory.reduce((sum, inv) => sum + inv.onHand, 0);

    return [
      {
        label: "Stock Bajo",
        value: lowStockItems,
        format: "number",
        change: lowStockItems > 0 ? 15.3 : -8.2,
        changeType: lowStockItems > 0 ? "negative" : "positive"
      },
      {
        label: "Valor Total",
        value: totalStockValue,
        format: "currency",
        change: 5.7,
        changeType: "positive"
      },
      {
        label: "Productos Únicos",
        value: inventory.length,
        format: "number",
        change: 2.1,
        changeType: "positive"
      },
      {
        label: "Unidades Totales",
        value: totalItems,
        format: "number",
        change: -1.2,
        changeType: "negative"
      }
    ];
  },

  /**
   * Calcula KPIs de ventas
   */
  calculateSalesKPIs(sales: Sale[], products: Product[]): KPIData[] {
    const totalVentas = sales.reduce((sum, sale) => sum + sale.total, 0);
    const avgTicket = sales.length > 0 ? totalVentas / sales.length : 0;
    
    // Calculate top product
    const productSales: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.qty;
      });
    });
    
    const topProductId = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    const topProduct = topProductId ? products.find(p => p.id === topProductId) : null;

    return [
      {
        label: 'Ventas Totales',
        value: totalVentas,
        change: 15.2,
        changeType: 'positive',
        format: 'currency'
      },
      {
        label: 'Ticket Promedio',
        value: avgTicket,
        change: -2.1,
        changeType: 'negative',
        format: 'currency'
      },
      {
        label: 'Producto Top',
        value: topProduct?.nombre || 'Sin datos',
        change: 8.5,
        changeType: 'positive'
      }
    ];
  },

  /**
   * Calcula productos más vendidos por ingresos
   */
  calculateTopProducts(sales: Sale[], products: Product[], limit: number = 5) {
    const ventasProductos = sales.reduce((acumulador, venta) => {
      venta.items.forEach(item => {
        const producto = products.find(p => p.id === item.productId);
        if (producto) {
          if (!acumulador[producto.id]) {
            acumulador[producto.id] = { producto, totalVendido: 0, ingresos: 0 };
          }
          acumulador[producto.id].totalVendido += item.qty;
          acumulador[producto.id].ingresos += item.qty * item.unitPrice;
        }
      });
      return acumulador;
    }, {} as Record<string, { producto: Product; totalVendido: number; ingresos: number }>);

    return Object.values(ventasProductos)
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, limit);
  },

  /**
   * Calcula distribución de métodos de pago
   */
  calculatePaymentMethodDistribution(sales: Sale[]) {
    const metodos = sales.reduce((acumulador, venta) => {
      acumulador[venta.metodoPago] = (acumulador[venta.metodoPago] || 0) + 1;
      return acumulador;
    }, {} as Record<string, number>);

    return Object.entries(metodos).map(([metodo, cantidad]) => ({
      name: metodo.charAt(0).toUpperCase() + metodo.slice(1),
      value: cantidad,
      percentage: (sales.length > 0 ? (cantidad / sales.length * 100).toFixed(1) : '0.0')
    }));
  }
};

import { useMemo } from 'react';
import { SaleItem } from '@/types';

/**
 * Hook para cálculos de totales de venta
 * Memoizado para evitar recálculos innecesarios
 */
export function useSaleCalculations(items: SaleItem[]) {
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const precioConDescuento = item.unitPrice * (1 - (item.discount || 0) / 100);
      return sum + precioConDescuento * item.qty;
    }, 0);

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    return {
      subtotal,
      iva,
      total,
      itemCount: items.length,
      totalUnits: items.reduce((sum, item) => sum + item.qty, 0),
    };
  }, [items]);

  return calculations;
}

import { useState, useCallback } from 'react';
import { SaleItem, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ERROR_MESSAGES } from '@/constants/messages';
import { LIMITS } from '@/constants/limits';

/**
 * Hook para manejo de productos en una venta
 */
export function useSaleProducts() {
  const [productosAgregados, setProductosAgregados] = useState<SaleItem[]>([]);
  const { toast } = useToast();

  const agregarProducto = useCallback((producto: Product) => {
    setProductosAgregados((prev) => {
      const existente = prev.find((p) => p.productId === producto.id);

      if (existente) {
        toast({
          title: "Producto duplicado",
          description: `${producto.nombre} ya está en la venta. Ajusta la cantidad si necesitas más.`,
          variant: "destructive",
        });
        return prev; // No cambiar estado si ya existe
      }

      const nuevoItem: SaleItem = {
        productId: producto.id,
        qty: 1,
        unitPrice: producto.precio,
        discount: 0,
      };

      return [...prev, nuevoItem];
    });
  }, [toast]);

  const eliminarProducto = useCallback((productoId: string) => {
    setProductosAgregados((prev) => prev.filter((p) => p.productId !== productoId));
  }, []);

  const actualizarCantidadProducto = useCallback((productoId: string, cantidad: number) => {
    if (cantidad < LIMITS.SALE.QUANTITY_MIN || cantidad > LIMITS.SALE.QUANTITY_MAX) {
      toast({
        title: "Cantidad inválida",
        description: ERROR_MESSAGES.SALE_INVALID_QUANTITY,
        variant: "destructive",
      });
      return;
    }

    setProductosAgregados((prev) =>
      prev.map((p) =>
        p.productId === productoId ? { ...p, qty: cantidad } : p
      )
    );
  }, [toast]);

  const actualizarDescuentoProducto = useCallback((productoId: string, descuento: number) => {
    if (descuento < LIMITS.SALE.DISCOUNT_MIN || descuento > LIMITS.SALE.DISCOUNT_MAX) {
      toast({
        title: "Descuento inválido",
        description: `El descuento debe estar entre ${LIMITS.SALE.DISCOUNT_MIN}% y ${LIMITS.SALE.DISCOUNT_MAX}%`,
        variant: "destructive",
      });
      return;
    }

    setProductosAgregados((prev) =>
      prev.map((p) =>
        p.productId === productoId ? { ...p, discount: descuento } : p
      )
    );
  }, [toast]);

  const resetearProductos = useCallback(() => {
    setProductosAgregados([]);
  }, []);

  return {
    productosAgregados,
    agregarProducto,
    eliminarProducto,
    actualizarCantidadProducto,
    actualizarDescuentoProducto,
    resetearProductos,
  };
}

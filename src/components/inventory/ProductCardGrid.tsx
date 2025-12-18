import { ProductCard } from './ProductCard';
import { Product, Inventory } from '@/types';
import { EmptyState } from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface ProductCardGridProps {
  items: InventoryWithProduct[];
  onProductClick: (item: InventoryWithProduct) => void;
}

export function ProductCardGrid({ items, onProductClick }: ProductCardGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No hay productos"
        description="No se encontraron productos que coincidan con los filtros aplicados"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <ProductCard
          key={`${item.productId}-${item.warehouseId}`}
          item={item}
          onClick={() => onProductClick(item)}
        />
      ))}
    </div>
  );
}

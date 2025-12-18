import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { Product, Inventory } from '@/types';
import { cn } from '@/lib/utils';

interface InventoryWithProduct extends Inventory {
  product: Product;
}

interface ProductCardProps {
  item: InventoryWithProduct;
  onClick: () => void;
}

export function ProductCard({ item, onClick }: ProductCardProps) {
  const { product, onHand } = item;

  const getStockStatus = () => {
    if (onHand <= product.reorderPoint) {
      return { label: 'Stock Bajo', variant: 'destructive' as const };
    } else if (onHand <= product.safetyStock + product.reorderPoint) {
      return { label: 'Stock Medio', variant: 'warning' as const };
    }
    return { label: 'En Stock', variant: 'success' as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2",
        "bg-card hover:border-primary/30"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Product Image Placeholder */}
        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          <Package className="w-16 h-16 text-muted-foreground/40" />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight min-h-[2.5rem]">
            {product.nombre}
          </h3>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              {product.marca}
            </p>
            <p className="text-xs text-muted-foreground">
              {product.categoria}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-bold text-foreground">
              ${product.precio.toLocaleString('es-MX')}
            </span>
            <span className="text-sm text-muted-foreground">
              ${(product.precio * 1).toLocaleString('es-MX')} MXN
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Stock: {onHand} {product.unidad}
            </span>
            <Badge variant={stockStatus.variant} className="text-xs">
              {stockStatus.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sale, Product } from '@/types';

/**
 * Definiciones memoizadas de columnas para tablas
 * Evita recrear objetos en cada render
 */

export const getVentasColumns = (getMetodoPagoBadge: (metodo: Sale['metodoPago']) => JSX.Element) => [
  { key: 'id', header: 'ID Venta' },
  { 
    key: 'fechaISO', 
    header: 'Fecha',
    render: (value: string) => {
      if (!value) return <span className="text-muted-foreground">Sin fecha</span>;
      try {
        return (
          <div>
            <div className="font-medium">
              {format(new Date(value), 'dd/MM/yyyy', { locale: es })}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(value), 'HH:mm')}
            </div>
          </div>
        );
      } catch (error) {
        return <span className="text-destructive">Fecha inválida</span>;
      }
    }
  },
  { key: 'vendedor', header: 'Vendedor' },
  { 
    key: 'metodoPago', 
    header: 'Método Pago',
    render: (value: Sale['metodoPago']) => getMetodoPagoBadge(value)
  },
  { 
    key: 'subtotal', 
    header: 'Subtotal',
    render: (value: number) => {
      if (typeof value !== 'number' || isNaN(value)) return <span className="text-destructive">-</span>;
      return <span className="text-right block">${value.toFixed(2)}</span>;
    }
  },
  { 
    key: 'iva', 
    header: 'IVA',
    render: (value: number) => {
      if (typeof value !== 'number' || isNaN(value)) return <span className="text-destructive">-</span>;
      return <span className="text-right text-muted-foreground block">${value.toFixed(2)}</span>;
    }
  },
  { 
    key: 'total', 
    header: 'Total',
    render: (value: number) => {
      if (typeof value !== 'number' || isNaN(value)) return <span className="text-destructive">-</span>;
      return <span className="text-right font-medium block">${value.toFixed(2)}</span>;
    }
  },
  { 
    key: 'items', 
    header: 'Items',
    render: (value: any[]) => (
      <div className="text-center">
        <Badge variant="outline">{value.length} items</Badge>
      </div>
    )
  }
];

interface InventoryWithProduct {
  onHand: number;
  reserved: number;
  product: Product;
}

export const getInventoryColumns = (
  handleEditProduct: (product: Product) => void,
  getStockStatusBadge: (inv: InventoryWithProduct) => JSX.Element
) => [
  {
    key: 'product.sku',
    header: 'SKU',
    sortable: true,
    render: (_: any, row: InventoryWithProduct) => (
      <span className="font-mono text-sm">{row.product.sku}</span>
    )
  },
  {
    key: 'product.nombre',
    header: 'Producto',
    sortable: true,
    render: (_: any, row: InventoryWithProduct) => (
      <div>
        <p className="font-medium">{row.product.nombre}</p>
        <p className="text-sm text-muted-foreground">{row.product.marca}</p>
      </div>
    )
  },
  {
    key: 'product.categoria',
    header: 'Categoría',
    sortable: true,
    render: (_: any, row: InventoryWithProduct) => (
      <Badge variant="outline">{row.product.categoria}</Badge>
    )
  },
  {
    key: 'onHand',
    header: 'Stock',
    sortable: true,
    render: (_: any, row: InventoryWithProduct) => (
      <div className="text-right">
        <span className="font-medium">{row.onHand}</span>
        <span className="text-sm text-muted-foreground ml-1">{row.product.unidad}</span>
      </div>
    )
  },
  {
    key: 'product.precio',
    header: 'Precio',
    sortable: true,
    render: (_: any, row: InventoryWithProduct) => (
      <span className="font-medium">
        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(row.product.precio)}
      </span>
    )
  },
  {
    key: 'status',
    header: 'Estado',
    render: (_: any, row: InventoryWithProduct) => getStockStatusBadge(row)
  },
  {
    key: 'actions',
    header: 'Acciones',
    render: (_: any, row: InventoryWithProduct) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEditProduct(row.product)}
      >
        <Edit className="w-4 h-4" />
      </Button>
    )
  }
];

export const getProductsColumns = () => [
  {
    key: 'nombre',
    label: 'Nombre',
    render: (product: Product) => (
      <div>
        <div className="font-medium">{product.nombre}</div>
        <div className="text-sm text-muted-foreground">{product.marca}</div>
      </div>
    ),
  },
  {
    key: 'sku',
    label: 'SKU',
    render: (product: Product) => (
      <span className="font-mono text-sm">{product.sku}</span>
    ),
  },
  {
    key: 'categoria',
    label: 'Categoría',
    render: (product: Product) => <Badge variant="outline">{product.categoria}</Badge>,
  },
  {
    key: 'precio',
    label: 'Precio',
    render: (product: Product) => (
      <span className="font-semibold text-success">
        ${product.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
];

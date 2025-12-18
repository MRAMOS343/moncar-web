import { useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/ui/kpi-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Columna } from '@/components/ui/data-table';
import { ProductModal } from '@/components/modals/ProductModal';
import { ProductCardGrid } from '@/components/inventory/ProductCardGrid';
import { ProductDetailModal } from '@/components/inventory/ProductDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Download, Upload, AlertTriangle, Package, TrendingDown, Plus, Edit, X, Filter, LayoutGrid, List } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useDebounce } from '@/hooks/useDebounce';
import { getInventoryColumns } from '@/config/tableColumns';
import { Product, Inventory, User, KPIData } from '../types';
import { exportToCSV } from '@/utils/exportCSV';
import { EmptyState } from '@/components/ui/empty-state';
import { useLoadingState } from '@/hooks/useLoadingState';
import { KPISkeleton } from '@/components/ui/kpi-skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContextType {
  currentWarehouse: string;
  searchQuery: string;
  currentUser: User;
}

interface InventoryWithProduct extends Inventory {
  product: Product;
}

type ViewMode = 'table' | 'grid';

export default function InventarioPage() {
  const { currentWarehouse, searchQuery, currentUser } = useOutletContext<ContextType>();
  const { products, inventory, getProductById, getWarehouseById } = useData();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedMarca, setSelectedMarca] = useState<string>('all');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryWithProduct | null>(null);
  const { isLoading } = useLoadingState({ minLoadingTime: 600 });
  const isMobile = useIsMobile();

  // Get unique brands and categories for filters
  const marcas = useMemo(() => [...new Set(products.map(p => p.marca))], [products]);
  const categorias = useMemo(() => [...new Set(products.map(p => p.categoria))], [products]);

  // Filter inventory data for current warehouse
  const warehouseInventory = useMemo(() => {
    return inventory
      .filter(inv => currentWarehouse === 'all' || inv.warehouseId === currentWarehouse)
      .map(inv => {
        const product = getProductById(inv.productId);
        return product ? { ...inv, product } : null;
      })
      .filter((item): item is InventoryWithProduct => item !== null)
      .filter(item => {
        // Search filter with debounce
        if (debouncedSearchQuery) {
          const searchLower = debouncedSearchQuery.toLowerCase();
          if (!item.product.nombre.toLowerCase().includes(searchLower) && 
              !item.product.sku.toLowerCase().includes(searchLower) && 
              !item.product.marca.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        // Brand filter
        if (selectedMarca !== 'all' && item.product.marca !== selectedMarca) {
          return false;
        }

        // Category filter
        if (selectedCategoria !== 'all' && item.product.categoria !== selectedCategoria) {
          return false;
        }

        return true;
      });
  }, [inventory, currentWarehouse, debouncedSearchQuery, selectedMarca, selectedCategoria]);

  // Calculate KPIs for current warehouse
  const warehouseKPIs = useMemo((): KPIData[] => {
    const lowStockItems = warehouseInventory.filter(inv => inv.onHand <= inv.product.reorderPoint).length;
    const totalStockValue = warehouseInventory.reduce((sum, inv) => sum + (inv.onHand * inv.product.precio), 0);
    const totalItems = warehouseInventory.reduce((sum, inv) => sum + inv.onHand, 0);

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
        value: warehouseInventory.length,
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
  }, [warehouseInventory]);

  // Calculate global totals across all warehouses
  const globalTotals = useMemo(() => {
    const allInventory = inventory.map(inv => {
      const product = getProductById(inv.productId);
      return product ? { ...inv, product } : null;
    }).filter((item): item is InventoryWithProduct => item !== null);

    const totalStockValue = allInventory.reduce((sum, inv) => sum + (inv.onHand * inv.product.precio), 0);
    const uniqueProducts = new Set(allInventory.map(inv => inv.productId)).size;
    const totalItems = allInventory.reduce((sum, inv) => sum + inv.onHand, 0);

    // Group by warehouse
    const byWarehouse = allInventory.reduce((acc, inv) => {
      if (!acc[inv.warehouseId]) {
        acc[inv.warehouseId] = { products: 0, items: 0, value: 0 };
      }
      acc[inv.warehouseId].products += 1;
      acc[inv.warehouseId].items += inv.onHand;
      acc[inv.warehouseId].value += inv.onHand * inv.product.precio;
      return acc;
    }, {} as Record<string, { products: number; items: number; value: number }>);

    return {
      totalStockValue,
      uniqueProducts,
      totalItems,
      byWarehouse
    };
  }, [inventory, getProductById]);

  // Helper functions defined BEFORE useMemo to avoid initialization errors
  const getStockStatusBadge = useCallback((inv: InventoryWithProduct) => {
    if (inv.onHand <= inv.product.reorderPoint) {
      return <Badge variant="destructive">Stock Bajo</Badge>;
    } else if (inv.onHand <= inv.product.safetyStock + inv.product.reorderPoint) {
      return <Badge variant="warning">Stock Medio</Badge>;
    } else {
      return <Badge variant="success">Stock Alto</Badge>;
    }
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  }, []);

  // Memoized columns with explicit dependencies
  const inventoryColumns = useMemo(() => 
    getInventoryColumns(handleEditProduct, getStockStatusBadge),
    [handleEditProduct, getStockStatusBadge]
  );

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (editingProduct) {
      showSuccessToast("Producto actualizado", `${productData.nombre} ha sido actualizado exitosamente.`);
    } else {
      showSuccessToast("Producto creado", `${productData.nombre} ha sido creado exitosamente.`);
    }
  };

  const handleExportCSV = () => {
    if (currentUser.role === 'cajero') {
      showErrorToast("Acceso denegado", "No tienes permisos para exportar datos.");
      return;
    }
    
    exportToCSV(
      warehouseInventory.map(inv => ({
        SKU: inv.product.sku,
        Producto: inv.product.nombre,
        Marca: inv.product.marca,
        Categoria: inv.product.categoria,
        Stock: inv.onHand,
        Unidad: inv.product.unidad,
        Precio: inv.product.precio,
        Estado: inv.onHand <= inv.product.reorderPoint ? 'Stock Bajo' : 
                inv.onHand <= inv.product.safetyStock + inv.product.reorderPoint ? 'Stock Medio' : 'Stock Alto'
      })),
      `inventario_${currentWarehouse === 'all' ? 'todas_sucursales' : currentWarehouse}_${new Date().toISOString().split('T')[0]}`
    );
    
    showSuccessToast("Exportación exitosa", "Los datos se han exportado a CSV correctamente.");
  };

  const handleImportCSV = () => {
    if (currentUser.role === 'cajero') {
      showErrorToast("Acceso denegado", "No tienes permisos para importar datos.");
      return;
    }
    
    showSuccessToast("Función no disponible", "La importación CSV estará disponible próximamente.");
  };

  const clearFilters = () => {
    setSelectedMarca('all');
    setSelectedCategoria('all');
  };

  const handleProductCardClick = (item: InventoryWithProduct) => {
    setSelectedInventoryItem(item);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            {currentWarehouse === 'all' 
              ? 'Todas las Sucursales' 
              : getWarehouseById(currentWarehouse)?.nombre || 'Sucursal no encontrada'
            }
          </p>
        </div>
        <div className="flex gap-2 self-end sm:self-auto flex-wrap">
          <Button variant="outline" onClick={handleExportCSV} size="sm" className="btn-hover touch-target" aria-label="Exportar inventario a CSV">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
          <Button variant="outline" onClick={handleImportCSV} size="sm" className="btn-hover touch-target" aria-label="Importar inventario desde CSV">
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Importar CSV</span>
          </Button>
          <Button onClick={handleCreateProduct} size="sm" className="btn-hover touch-target" aria-label="Crear nuevo producto">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="warehouse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="warehouse">Vista por Sucursal</TabsTrigger>
          <TabsTrigger value="global">Totales Globales</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <>
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
              </>
            ) : (
              warehouseKPIs.map((kpi, index) => (
                <KPICard key={index} data={kpi} className="animate-fade-in card-hover" />
              ))
            )}
          </div>

          {/* Filters */}
          {isMobile ? (
            <Accordion type="single" collapsible defaultValue="filtros">
              <AccordionItem value="filtros">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-base font-medium">Marca</label>
                      <Select value={selectedMarca} onValueChange={setSelectedMarca}>
                        <SelectTrigger className="mobile-select">
                          <SelectValue placeholder="Todas las marcas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las marcas</SelectItem>
                          {marcas.map((marca) => (
                            <SelectItem key={marca} value={marca}>
                              {marca}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-base font-medium">Categoría</label>
                      <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                        <SelectTrigger className="mobile-select">
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="w-full mobile-button"
                      disabled={selectedMarca === 'all' && selectedCategoria === 'all'}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>
                  Filtra los productos por marca y categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Marca</label>
                    <Select value={selectedMarca} onValueChange={setSelectedMarca}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las marcas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las marcas</SelectItem>
                        {marcas.map((marca) => (
                          <SelectItem key={marca} value={marca}>
                            {marca}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoría</label>
                    <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="w-full"
                      disabled={selectedMarca === 'all' && selectedCategoria === 'all'}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory Table/Grid */}
          <Card className="card-hover animate-fade-in">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Productos en Inventario</CardTitle>
                  <CardDescription>
                    {warehouseInventory.length} productos en {
                      currentWarehouse === 'all' 
                        ? 'todas las sucursales' 
                        : getWarehouseById(currentWarehouse)?.nombre
                    }
                  </CardDescription>
                </div>
                <ToggleGroup 
                  type="single" 
                  value={viewMode} 
                  onValueChange={(value) => value && setViewMode(value as ViewMode)}
                  className="bg-muted rounded-lg p-1"
                >
                  <ToggleGroupItem value="table" aria-label="Vista de tabla" className="data-[state=on]:bg-background">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="grid" aria-label="Vista de cuadrícula" className="data-[state=on]:bg-background">
                    <LayoutGrid className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : viewMode === 'table' ? (
                <DataTable
                  data={warehouseInventory}
                  columns={inventoryColumns}
                  searchable={true}
                  searchPlaceholder="Buscar por nombre, SKU o marca..."
                  emptyMessage="No hay productos en inventario"
                  emptyDescription="No se encontraron productos que coincidan con los filtros aplicados"
                />
              ) : (
                <ProductCardGrid 
                  items={warehouseInventory} 
                  onProductClick={handleProductCardClick} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          {/* Global KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard data={{
              label: "Valor Total Global",
              value: globalTotals.totalStockValue,
              format: "currency",
              change: 8.3,
              changeType: "positive"
            }} />
            <KPICard data={{
              label: "Productos Únicos",
              value: globalTotals.uniqueProducts,
              format: "number",
              change: 3.2,
              changeType: "positive"
            }} />
            <KPICard data={{
              label: "Total de Unidades",
              value: globalTotals.totalItems,
              format: "number",
              change: -0.8,
              changeType: "negative"
            }} />
            <KPICard data={{
              label: "Sucursales Activas",
              value: Object.keys(globalTotals.byWarehouse).length,
              format: "number"
            }} />
          </div>

          {/* Breakdown by Warehouse */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen por Sucursal</CardTitle>
              <CardDescription>
                Distribución del inventario por sucursal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(globalTotals.byWarehouse).map(([warehouseId, data]) => {
                  const warehouse = getWarehouseById(warehouseId);
                  return (
                    <div key={warehouseId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{warehouse?.nombre || 'Sucursal desconocida'}</p>
                          <p className="text-sm text-muted-foreground">{warehouse?.direccion}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-right">
                        <div>
                          <p className="text-sm text-muted-foreground">Productos</p>
                          <p className="font-semibold">{data.products}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Unidades</p>
                          <p className="font-semibold">{data.items.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Valor</p>
                          <p className="font-semibold">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data.value)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Modal */}
      <ProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        item={selectedInventoryItem}
      />
    </div>
  );
}
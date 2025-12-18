import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, AlertTriangle, Package, TrendingDown, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useProductCache } from '@/hooks/useProductCache';
import { User, PurchaseSuggestion } from '../types';
import { useLoadingState } from '@/hooks/useLoadingState';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/utils/toastHelpers';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContextType {
  currentWarehouse: string;
  searchQuery: string;
  currentUser: User;
}

export default function ComprasPage() {
  const { currentWarehouse, searchQuery, currentUser } = useOutletContext<ContextType>();
  const { inventory, getProductById, getWarehouseById } = useData();
  const { getProductName } = useProductCache();
  const [leadTimeDias, setLeadTimeDias] = useState<number>(7);
  const [safetyStockPercent, setSafetyStockPercent] = useState<number>(20);
  const [horizonteSemanas, setHorizonteSemanas] = useState<number>(4);
  const { isLoading } = useLoadingState({ minLoadingTime: 600 });
  const isMobile = useIsMobile();

  // Generate purchase suggestions
  const purchaseSuggestions: PurchaseSuggestion[] = useMemo(() => {
    const warehouseInventory = currentWarehouse === 'all'
      ? inventory
      : inventory.filter(inv => inv.warehouseId === currentWarehouse);
    
    return warehouseInventory
      .map(inv => {
        const product = getProductById(inv.productId);
        if (!product) return null;

        // Simulate demand calculation (in real app, this would come from forecasting service)
        const avgWeeklyDemand = Math.random() * 10 + 2; // Mock average weekly demand
        const demandaEsperada = avgWeeklyDemand * horizonteSemanas;
        const demandaLeadTime = avgWeeklyDemand * (leadTimeDias / 7);
        
        // Calculate safety stock
        const calculatedSafetyStock = Math.max(
          product.safetyStock,
          (avgWeeklyDemand * safetyStockPercent) / 100
        );
        
        // Calculate suggested quantity
        const requiredStock = demandaLeadTime + calculatedSafetyStock;
        const qtySugerida = Math.max(0, Math.ceil(requiredStock - inv.onHand));
        
        // Calculate coverage in days
        const coberturaDias = inv.onHand > 0 ? (inv.onHand / avgWeeklyDemand) * 7 : 0;
        
        return {
          productId: inv.productId,
          warehouseId: inv.warehouseId,
          onHand: inv.onHand,
          reorderPoint: product.reorderPoint,
          demandaEsperada: Math.round(demandaEsperada * 100) / 100,
          coberturaDias: Math.round(coberturaDias * 100) / 100,
          qtySugerida,
          costo: qtySugerida * product.precio
        } as PurchaseSuggestion;
      })
      .filter((suggestion): suggestion is PurchaseSuggestion => suggestion !== null)
      .filter(suggestion => {
        const product = getProductById(suggestion.productId);
        if (!product) return false;
        
        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          if (!product.nombre.toLowerCase().includes(searchLower) &&
              !product.sku.toLowerCase().includes(searchLower) &&
              !product.marca.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        
        // Only show items that need reordering
        return suggestion.qtySugerida > 0;
      })
      .sort((a, b) => {
        // Sort by urgency (lower coverage days first)
        return a.coberturaDias - b.coberturaDias;
      });
  }, [currentWarehouse, leadTimeDias, safetyStockPercent, horizonteSemanas, searchQuery]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalItems = purchaseSuggestions.length;
    const totalCost = purchaseSuggestions.reduce((sum, item) => sum + (item.costo || 0), 0);
    const urgentItems = purchaseSuggestions.filter(item => item.coberturaDias <= 7).length;
    
    return { totalItems, totalCost, urgentItems };
  }, [purchaseSuggestions]);

  const handleGeneratePreOrder = () => {
    if (currentUser.role === 'cajero') {
      showErrorToast("Acceso denegado", "Solo gerentes y administradores pueden generar pre-órdenes.");
      return;
    }

    showInfoToast("Función requiere backend", "La generación de pre-órdenes estará disponible cuando se conecte un backend real.");
  };

  const handleExport = () => {
    showSuccessToast("Exportando sugerencias", "Generando archivo CSV con las sugerencias de compra...");
  };

  const getUrgencyBadge = (coberturaDias: number) => {
    if (coberturaDias <= 3) {
      return <Badge variant="destructive">Crítico</Badge>;
    } else if (coberturaDias <= 7) {
      return <Badge variant="secondary">Urgente</Badge>;
    } else if (coberturaDias <= 14) {
      return <Badge variant="outline">Normal</Badge>;
    } else {
      return <Badge variant="default">Bajo</Badge>;
    }
  };

  return (
    <main role="main" aria-label="Contenido principal">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading ? "Cargando sugerencias de compra..." : `${purchaseSuggestions.length} sugerencias encontradas`}
      </div>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Compra Sugerida</h1>
          <p className="text-sm text-muted-foreground">
            Sugerencias de reabastecimiento basadas en demanda y stock actual
          </p>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Button onClick={handleExport} variant="outline" size="sm" className="btn-hover touch-target" aria-label="Exportar sugerencias de compra a CSV">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button 
            onClick={handleGeneratePreOrder} 
            size="sm"
            disabled={currentUser.role === 'cajero' || purchaseSuggestions.length === 0}
            className="btn-hover touch-target"
            aria-label="Generar pre-orden de compra"
          >
            <ShoppingCart className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Generar Pre-orden</span>
          </Button>
        </div>
      </div>

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Los cálculos son simulados. En producción, estos datos provendrían de sistemas de forecasting y gestión de inventario reales.
        </AlertDescription>
      </Alert>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cálculo</CardTitle>
          <CardDescription>
            Ajusta los parámetros para el cálculo de sugerencias de compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time (días)</Label>
              <Input
                id="leadTime"
                type="number"
                value={leadTimeDias}
                onChange={(e) => setLeadTimeDias(Number(e.target.value))}
                min="1"
                max="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safetyStock">Safety Stock (%)</Label>
              <Input
                id="safetyStock"
                type="number"
                value={safetyStockPercent}
                onChange={(e) => setSafetyStockPercent(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horizon">Horizonte (semanas)</Label>
              <Input
                id="horizon"
                type="number"
                value={horizonteSemanas}
                onChange={(e) => setHorizonteSemanas(Number(e.target.value))}
                min="1"
                max="12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="kpi-card card-hover animate-fade-in">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Items a Comprar</p>
              <p className="text-2xl font-bold">{summaryMetrics.totalItems}</p>
            </div>
          </div>
        </Card>

        <Card className="kpi-card card-hover animate-fade-in">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Costo Total Estimado</p>
              <p className="text-2xl font-bold">
                ${summaryMetrics.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="kpi-card card-hover animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Items Urgentes</p>
              <p className="text-2xl font-bold">{summaryMetrics.urgentItems}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Purchase Suggestions Table */}
      <Card className="data-table card-hover animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sugerencias de Compra</CardTitle>
              <CardDescription>
                Productos que requieren reabastecimiento en {
                  currentWarehouse === 'all' 
                    ? 'todas las sucursales' 
                    : getWarehouseById(currentWarehouse)?.nombre || 'Sucursal desconocida'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={5} columns={9} />
          ) : purchaseSuggestions.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No hay sugerencias de compra"
              description="Todos los productos tienen stock suficiente o ajusta los parámetros de configuración."
            />
          ) : (
            <ResponsiveTable
              data={purchaseSuggestions}
              columns={[
                { 
                  key: 'productId', 
                  header: 'SKU',
                  render: (value: string) => {
                    const product = getProductById(value);
                    return <span className="font-mono text-sm">{product?.sku}</span>;
                  }
                },
                { 
                  key: 'productId', 
                  header: 'Producto',
                  render: (value: string) => {
                    const product = getProductById(value);
                    return (
                      <div>
                        <div className="font-medium">{product?.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {product?.marca} - {product?.categoria}
                        </div>
                      </div>
                    );
                  }
                },
                { key: 'onHand', header: 'Stock Actual', render: (value: number) => <span className="text-right block">{value}</span> },
                { key: 'reorderPoint', header: 'Punto Reorden', render: (value: number) => <span className="text-right block">{value}</span> },
                { key: 'demandaEsperada', header: 'Demanda Esperada', render: (value: number) => <span className="text-right block">{value}</span> },
                { 
                  key: 'coberturaDias', 
                  header: 'Cobertura (días)',
                  render: (value: number) => (
                    <span className={`text-right block ${value <= 7 ? 'text-destructive font-medium' : ''}`}>
                      {value.toFixed(1)}
                    </span>
                  )
                },
                { key: 'qtySugerida', header: 'Cantidad Sugerida', render: (value: number) => <span className="text-right font-medium text-primary block">{value}</span> },
                { key: 'costo', header: 'Costo Estimado', render: (value: number) => <span className="text-right block">${value?.toFixed(2) || '0.00'}</span> },
                { 
                  key: 'coberturaDias', 
                  header: 'Urgencia',
                  render: (value: number) => <div className="text-center">{getUrgencyBadge(value)}</div>
                }
              ]}
              mobileCardRender={(suggestion) => {
                const product = getProductById(suggestion.productId);
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{product?.nombre}</p>
                        <p className="text-xs text-muted-foreground">{product?.marca}</p>
                      </div>
                      {getUrgencyBadge(suggestion.coberturaDias)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Stock Actual</p>
                        <p className="font-medium">{suggestion.onHand}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cant. Sugerida</p>
                        <p className="font-medium text-primary">{suggestion.qtySugerida}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cobertura</p>
                        <p className={suggestion.coberturaDias <= 7 ? 'text-destructive font-medium' : ''}>
                          {suggestion.coberturaDias.toFixed(1)} días
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Costo</p>
                        <p className="font-medium">${suggestion.costo?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </CardContent>
      </Card>
      </div>
    </main>
  );
}
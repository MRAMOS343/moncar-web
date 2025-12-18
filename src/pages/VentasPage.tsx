import { useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/ui/kpi-card';
import { getProductByIdSafe, hasItems } from '@/utils/safeData';
import { logger } from '@/utils/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Plus, Download, ShoppingBag, Filter } from 'lucide-react';
import { LazyLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '@/components/charts/LazyLineChart';
import { useData } from '@/contexts/DataContext';
import { useProductCache } from '@/hooks/useProductCache';
import { getVentasColumns } from '@/config/tableColumns';
import { Sale, User, KPIData, ChartDataPoint } from '../types';
import { format, startOfDay, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { exportToCSV } from '@/utils/exportCSV';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ChartSkeleton } from '@/components/ui/chart-skeleton';
import { KPISkeleton } from '@/components/ui/kpi-skeleton';
import { useLoadingState } from '@/hooks/useLoadingState';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toastHelpers';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContextType {
  currentWarehouse: string;
  searchQuery: string;
  currentUser: User;
}

export default function VentasPage() {
  const { currentWarehouse, currentUser } = useOutletContext<ContextType>();
  const { sales, getWarehouseById } = useData();
  const { getProductName } = useProductCache();
  
  // Memoize getProductName to prevent unnecessary re-renders
  const getProductNameMemo = useCallback((id: string) => getProductName(id), [getProductName]);
  const [selectedMetodoPago, setSelectedMetodoPago] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const { isLoading } = useLoadingState({ minLoadingTime: 1000 });
  const isMobile = useIsMobile();

  // Filter sales data
  const filteredSales = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return sales
      .filter(sale => currentWarehouse === 'all' || sale.warehouseId === currentWarehouse)
      .filter(sale => new Date(sale.fechaISO) >= startDate)
      .filter(sale => selectedMetodoPago && selectedMetodoPago !== 'all' ? sale.metodoPago === selectedMetodoPago : true)
      .sort((a, b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime());
  }, [sales, currentWarehouse, selectedMetodoPago, dateRange]);

  // Calculate KPIs
  const kpis: KPIData[] = useMemo(() => {
    const totalVentas = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const avgTicket = totalVentas / (filteredSales.length || 1);
    
    // Calculate top product
    const productSales: Record<string, number> = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.qty;
      });
    });
    
    const topProductId = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    const topProductName = topProductId ? getProductNameMemo(topProductId).split(' - ')[0] : 'Sin datos';

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
        value: topProductName,
        change: 8.5,
        changeType: 'positive'
      }
    ];
  }, [filteredSales, getProductNameMemo]);

  // Generate chart data
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!hasItems(filteredSales)) {
      return [];
    }
    
    const salesByDay: Record<string, number> = {};
    
    filteredSales.forEach(sale => {
      const day = format(new Date(sale.fechaISO), 'yyyy-MM-dd');
      salesByDay[day] = (salesByDay[day] || 0) + sale.total;
    });

    return Object.entries(salesByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date: format(new Date(date), 'dd/MM', { locale: es }),
        value
      }));
  }, [filteredSales]);

  const handleCreateSale = () => {
    if (currentUser.role === 'admin' || currentUser.role === 'gerente' || currentUser.role === 'cajero') {
      showInfoToast(
        "Funcionalidad disponible próximamente",
        "El módulo de creación de ventas será implementado en la siguiente versión."
      );
    } else {
      showErrorToast(
        "Acceso denegado",
        "No tienes permisos para crear ventas."
      );
    }
  };

  const getMetodoPagoBadge = (metodo: Sale['metodoPago']) => {
    const variants = {
      efectivo: 'default',
      tarjeta: 'secondary',
      transferencia: 'outline',
      credito: 'destructive'
    } as const;

    return <Badge variant={variants[metodo]}>{metodo}</Badge>;
  };

  const handleExportCSV = () => {
    logger.info('Exportación de ventas iniciada', {
      cantidadVentas: filteredSales.length,
      dateRange
    });
    
    exportToCSV(
      filteredSales.map(sale => ({
        ID: sale.id,
        Fecha: format(new Date(sale.fechaISO), 'dd/MM/yyyy HH:mm', { locale: es }),
        Vendedor: sale.vendedor || 'Sin asignar',
        MetodoPago: sale.metodoPago,
        Subtotal: sale.subtotal,
        IVA: sale.iva,
        Total: sale.total,
        Items: sale.items.length
      })),
      `ventas_${dateRange}_${new Date().toISOString().split('T')[0]}`
    );
    
    showSuccessToast(
      "Exportación exitosa",
      "Los datos de ventas se han exportado a CSV correctamente."
    );
    
    logger.info('Exportación de ventas completada exitosamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Registro de ventas en {
              currentWarehouse === 'all' 
                ? 'Todas las Sucursales' 
                : getWarehouseById(currentWarehouse)?.nombre || 'Sucursal no encontrada'
            }
          </p>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Button onClick={handleCreateSale} size="sm" className="btn-hover touch-target" aria-label="Crear nueva venta">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Venta</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="btn-hover touch-target" aria-label="Exportar datos de ventas a CSV">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
          </>
        ) : (
          kpis.map((kpi, index) => (
            <KPICard key={index} data={kpi} className="animate-fade-in" />
          ))
        )}
      </div>

      {/* Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <Card className="chart-card animate-scale-in card-hover">
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
            <CardDescription>
              Ventas diarias en los últimos {dateRange === '7d' ? '7 días' : dateRange === '30d' ? '30 días' : '90 días'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LazyLineChart data={chartData} height={320}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ventas']}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LazyLineChart>
          </CardContent>
        </Card>
      )}

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
                  <label className="text-base font-medium">Período</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 días</SelectItem>
                      <SelectItem value="30d">Últimos 30 días</SelectItem>
                      <SelectItem value="90d">Últimos 90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-base font-medium">Método de Pago</label>
                  <Select value={selectedMetodoPago} onValueChange={setSelectedMetodoPago}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Todos los métodos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los métodos</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => {
                    setSelectedMetodoPago('all');
                    setDateRange('30d');
                  }} 
                  variant="outline"
                  className="w-full mobile-button"
                >
                  Limpiar filtros
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
              Filtra las ventas por período y método de pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                    <SelectItem value="30d">Últimos 30 días</SelectItem>
                    <SelectItem value="90d">Últimos 90 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de Pago</label>
                <Select value={selectedMetodoPago} onValueChange={setSelectedMetodoPago}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los métodos</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSelectedMetodoPago('all');
                    setDateRange('30d');
                  }} 
                  variant="outline"
                  className="w-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Table */}
      <Card className="data-table">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Ventas</CardTitle>
              <CardDescription>
                {filteredSales.length} ventas encontradas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={10} columns={8} />
          ) : filteredSales.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No hay ventas registradas"
              description="No se encontraron ventas que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda."
              action={{
                label: "Crear Nueva Venta",
                onClick: handleCreateSale
              }}
            />
          ) : (
            <ResponsiveTable
              data={filteredSales}
              columns={getVentasColumns(getMetodoPagoBadge)}
              mobileCardRender={(sale) => (
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{sale.id}</p>
                      <p className="font-medium text-lg">${sale.total.toFixed(2)}</p>
                    </div>
                    {getMetodoPagoBadge(sale.metodoPago)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{format(new Date(sale.fechaISO), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                    <p>Vendedor: {sale.vendedor || 'Sin asignar'}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span>{sale.items.length} items</span>
                      <span className="text-xs">IVA: ${sale.iva.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
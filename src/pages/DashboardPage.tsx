import { useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "@/components/charts/LazyLineChart";
import { LazyPieChart, Pie, Cell } from "@/components/charts/LazyPieChart";
import { TrendingUp, ShoppingCart, Package, DollarSign, AlertTriangle, Plus } from "lucide-react";
import { User, KPIData } from "@/types";
import { ProductModal } from "@/components/modals/ProductModal";
import { kpiService } from "@/services/kpiService";
import { filterService } from "@/services/filterService";
import { COLORES_GRAFICOS } from "@/constants";
import { useLoadingState } from "@/hooks/useLoadingState";
import { KPISkeleton } from "@/components/ui/kpi-skeleton";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { SUCCESS_MESSAGES } from "@/constants/messages";
import { useData } from "@/contexts/DataContext";
import { toast } from "@/hooks/use-toast";

interface ContextType {
  currentWarehouse: string;
  searchQuery: string;
  currentUser: User;
}

export default function DashboardPage() {
  const { currentWarehouse, currentUser } = useOutletContext<ContextType>();
  const navigate = useNavigate();
  const [productModalOpen, setProductModalOpen] = useState(false);
  const { isLoading } = useLoadingState({ minLoadingTime: 600 });
  const { sales, inventory, products, warehouses } = useData();

  // Cálculo de KPIs globales del negocio usando servicio
  const kpisGlobales = useMemo((): KPIData[] => {
    const ventasFiltradas = filterService.filterSalesByWarehouse(sales, currentWarehouse);
    const inventarioFiltrado = filterService.filterInventoryByWarehouse(inventory, currentWarehouse);
    
    return kpiService.calculateGlobalKPIs(ventasFiltradas, inventarioFiltrado, products);
  }, [currentWarehouse, sales, inventory, products]);

  // Datos de tendencia de ventas (últimos 7 días) para el gráfico lineal
  const datosTendenciaVentas = useMemo(() => {
    const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (6 - i));
      return fecha.toISOString().split('T')[0];
    });

    const ventasFiltradas = filterService.filterSalesByWarehouse(sales, currentWarehouse);

    return ultimos7Dias.map(fecha => {
      const totalDia = ventasFiltradas
        .filter(venta => venta.fechaISO.startsWith(fecha))
        .reduce((suma, venta) => suma + venta.total, 0);
      
      return {
        date: new Date(fecha).toLocaleDateString('es-MX', { weekday: 'short' }),
        value: totalDia
      };
    });
  }, [currentWarehouse, sales]);

  // Distribución de métodos de pago usando servicio
  const datosMetodosPago = useMemo(() => {
    const ventasFiltradas = filterService.filterSalesByWarehouse(sales, currentWarehouse);
    return kpiService.calculatePaymentMethodDistribution(ventasFiltradas);
  }, [currentWarehouse, sales]);

  // Productos más vendidos usando servicio
  const productosMasVendidos = useMemo(() => {
    const ventasFiltradas = filterService.filterSalesByWarehouse(sales, currentWarehouse);
    return kpiService.calculateTopProducts(ventasFiltradas, products, 5);
  }, [currentWarehouse, sales, products]);

  const handleNewSale = () => {
    navigate('/dashboard/ventas');
  };

  const handleAddProduct = () => {
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: "Producto creado",
      description: SUCCESS_MESSAGES.PRODUCT_CREATED(productData.nombre),
      className: "bg-success-light dark:bg-success-light border-success dark:border-success",
    });
    setProductModalOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado de la página principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema - {
              currentWarehouse === 'all' 
                ? 'Todas las Sucursales' 
                : warehouses.find(w => w.id === currentWarehouse)?.nombre || 'Sucursal no encontrada'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewSale} className="btn-hover">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </Button>
          <Button variant="outline" onClick={handleAddProduct} className="btn-hover">
            <Package className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Indicadores clave de rendimiento (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
          </>
        ) : (
          kpisGlobales.map((kpi, index) => (
            <KPICard key={index} data={kpi} className="animate-fade-in card-hover" />
          ))
        )}
      </div>

      {/* Fila de gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Gráfico de tendencia de ventas */}
            <Card className="card-hover animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendencia de Ventas (7 días)
                </CardTitle>
            <CardDescription>
              Evolución de las ventas en los últimos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LazyLineChart data={datosTendenciaVentas} height={320}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [
                  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value),
                  'Ventas'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
            </LazyLineChart>
          </CardContent>
        </Card>

            {/* Gráfico de métodos de pago */}
            <Card className="card-hover animate-fade-in">
              <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Métodos de Pago
            </CardTitle>
            <CardDescription>
              Distribución de métodos de pago utilizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LazyPieChart height={320}>
              <Pie
                data={datosMetodosPago}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={(entry) => {
                  const RADIAN = Math.PI / 180;
                  const { cx, cy, midAngle, outerRadius, name, percentage } = entry;
                  const radius = outerRadius + 30;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill="hsl(var(--foreground))"
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                    >
                      {`${name} ${percentage}%`}
                    </text>
                  );
                }}
              >
                {datosMetodosPago.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_GRAFICOS[index % COLORES_GRAFICOS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{
                  color: 'hsl(var(--foreground))'
                }}
                labelStyle={{
                  color: 'hsl(var(--foreground))'
                }}
              />
            </LazyPieChart>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Sección inferior con información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        <Card className="card-hover animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>
              Top 5 productos por ingresos generados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productosMasVendidos.map((item, index) => (
                <div key={item.producto.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">{item.producto.marca}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.ingresos)}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.totalVendido} vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sistema de alertas */}
        <Card className="card-hover animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription>
              Notificaciones importantes que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Alerta de stock bajo - crítica */}
              <div className="flex items-center gap-3 p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Stock Bajo</p>
                  <p className="text-xs text-muted-foreground">
                    {kpisGlobales[3].value} productos por debajo del punto de reorden
                  </p>
                </div>
                <Badge variant="destructive">Urgente</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-warning/20 rounded-lg bg-warning/5">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Ventas en Declive</p>
                  <p className="text-xs text-muted-foreground">
                    El ticket promedio ha disminuido 1.2% esta semana
                  </p>
                </div>
                <Badge variant="warning">Info</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 border border-info/20 rounded-lg bg-info/5">
                <TrendingUp className="w-5 h-5 text-info" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Crecimiento Positivo</p>
                  <p className="text-xs text-muted-foreground">
                    Las ventas totales han aumentado 12.5% este mes
                  </p>
                </div>
                <Badge variant="info">Good</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Modal */}
      <ProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        product={null}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, BarChart3, Calendar } from 'lucide-react';
import { LazyLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '@/components/charts/LazyLineChart';
import { useData } from '@/contexts/DataContext';
import { User, ChartDataPoint, ForecastData } from '../types';
import { addWeeks, format, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLoadingState } from '@/hooks/useLoadingState';
import { ChartSkeleton } from '@/components/ui/chart-skeleton';

interface ContextType {
  currentWarehouse: string;
  currentUser: User;
}

export default function PrediccionPage() {
  const { currentWarehouse, currentUser } = useOutletContext<ContextType>();
  const { products, warehouses, getProductById, getWarehouseById } = useData();
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || '');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(currentWarehouse);
  const [horizon, setHorizon] = useState<string>('8');
  const { isLoading } = useLoadingState({ minLoadingTime: 800 });

  // Generate mock forecast data
  const forecastData: ForecastData = useMemo(() => {
    const product = getProductById(selectedProduct);
    if (!product) {
      return {
        productId: '',
        warehouseId: '',
        historical: [],
        forecast: [],
        confidence: { upper: [], lower: [] },
        mae: 0,
        mape: 0
      };
    }

    const startDate = subWeeks(new Date(), 12);
    const historical: ChartDataPoint[] = [];
    const forecast: ChartDataPoint[] = [];
    const confidenceUpper: ChartDataPoint[] = [];
    const confidenceLower: ChartDataPoint[] = [];

    // Generate historical data (last 12 weeks)
    let baseValue = Math.random() * 50 + 20;
    for (let i = 0; i < 12; i++) {
      const date = addWeeks(startDate, i);
      const seasonality = Math.sin((i * 2 * Math.PI) / 12) * 5; // Weekly seasonality
      const noise = (Math.random() - 0.5) * 10;
      const value = Math.max(0, baseValue + seasonality + noise);
      
      historical.push({
        date: format(date, 'yyyy-MM-dd'),
        value: Math.round(value * 100) / 100,
        label: format(date, 'dd/MM', { locale: es })
      });
      
      baseValue += (Math.random() - 0.5) * 3; // Gradual trend
    }

    // Generate forecast data
    const horizonWeeks = parseInt(horizon);
    for (let i = 1; i <= horizonWeeks; i++) {
      const date = addWeeks(new Date(), i);
      const seasonality = Math.sin(((12 + i) * 2 * Math.PI) / 12) * 5;
      const trend = baseValue * 0.02 * i; // Small growth trend
      const value = Math.max(0, baseValue + seasonality + trend);
      
      const dateStr = format(date, 'yyyy-MM-dd');
      const label = format(date, 'dd/MM', { locale: es });
      
      forecast.push({
        date: dateStr,
        value: Math.round(value * 100) / 100,
        label
      });
      
      // Confidence intervals (wider as we go further)
      const confidence = 5 + (i * 2);
      confidenceUpper.push({
        date: dateStr,
        value: Math.round((value + confidence) * 100) / 100,
        label
      });
      
      confidenceLower.push({
        date: dateStr,
        value: Math.max(0, Math.round((value - confidence) * 100) / 100),
        label
      });
    }

    return {
      productId: selectedProduct,
      warehouseId: selectedWarehouse,
      historical,
      forecast,
      confidence: {
        upper: confidenceUpper,
        lower: confidenceLower
      },
      mae: Math.random() * 5 + 2, // Mock MAE
      mape: Math.random() * 15 + 8 // Mock MAPE
    };
  }, [selectedProduct, selectedWarehouse, horizon]);

  // Combine historical and forecast data for chart
  const chartData = useMemo(() => {
    const combined = [...forecastData.historical];
    
    // Add forecast data
    forecastData.forecast.forEach((point, index) => {
      combined.push({
        date: point.date,
        value: undefined, // Don't show actual value for forecast
        label: point.label,
        forecast: point.value,
        upperBound: forecastData.confidence.upper[index]?.value,
        lowerBound: forecastData.confidence.lower[index]?.value
      } as any); // Use any to allow additional properties for chart
    });
    
    return combined;
  }, [forecastData]);

  const selectedProductData = getProductById(selectedProduct);
  const selectedWarehouseData = getWarehouseById(selectedWarehouse);

  return (
    <main role="main" aria-label="Contenido principal">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Predicción de Ventas</h1>
          <p className="text-muted-foreground">
            Pronósticos de demanda simulados para productos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Simulación con datos sintéticos</span>
        </div>
      </div>

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Nota importante:</strong> Esta es una simulación con datos sintéticos. 
          Para implementación en producción, conectar a un servicio de pronóstico real con modelos de ML.
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Pronóstico</CardTitle>
          <CardDescription>
            Selecciona el producto, sucursal y horizonte de predicción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Producto</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku} - {product.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sucursal</label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Horizonte (semanas)</label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 semanas</SelectItem>
                  <SelectItem value="8">8 semanas</SelectItem>
                  <SelectItem value="12">12 semanas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Item Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-hover animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Producto Seleccionado</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProductData && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-mono">{selectedProductData.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="font-medium">{selectedProductData.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marca:</span>
                  <span>{selectedProductData.marca}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoría:</span>
                  <Badge variant="outline">{selectedProductData.categoria}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio:</span>
                  <span className="font-medium">${selectedProductData.precio.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Métricas del Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">MAE (Error Absoluto Medio):</span>
                <Badge variant="outline">
                  {forecastData.mae?.toFixed(2)} unidades
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">MAPE (Error Porcentual Medio):</span>
                <Badge variant={forecastData.mape && forecastData.mape < 15 ? "default" : "secondary"}>
                  {forecastData.mape?.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sucursal:</span>
                <span className="font-medium">{selectedWarehouseData?.nombre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Horizonte:</span>
                <span className="font-medium">{horizon} semanas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <Card className="chart-card card-hover animate-fade-in">
          <CardHeader>
            <CardTitle>Pronóstico de Demanda</CardTitle>
            <CardDescription>
              Histórico (azul) vs Pronóstico (rojo) con bandas de confianza (área sombreada)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LazyLineChart data={chartData} height={384}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="label" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'Unidades', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone"
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                name="Histórico" 
                strokeWidth={2} 
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              />
              <Line 
                type="monotone"
                dataKey="forecast" 
                stroke="hsl(var(--destructive))" 
                name="Pronóstico" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--destructive))', r: 3 }}
              />
              <Line 
                type="monotone"
                dataKey="upperBound" 
                stroke="hsl(var(--muted-foreground))" 
                name="Límite Superior" 
                strokeDasharray="2 2"
                dot={false}
                strokeWidth={1}
              />
              <Line 
                type="monotone"
                dataKey="lowerBound" 
                stroke="hsl(var(--muted-foreground))" 
                name="Límite Inferior" 
                strokeDasharray="2 2"
                dot={false}
                strokeWidth={1}
              />
            </LazyLineChart>
          </CardContent>
      </Card>
      )}
      </div>
    </main>
  );
}
import { Bell, AlertTriangle, Package, ShoppingCart, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { mockInventory, mockSales } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  icon: typeof AlertTriangle;
}

export function NotificationsPanel() {
  // Generar notificaciones basadas en el estado del sistema
  const notifications: Notification[] = [];

  // Verificar stock bajo
  const lowStockItems = mockInventory.filter(inv => inv.onHand <= 10);
  if (lowStockItems.length > 0) {
    notifications.push({
      id: 'low-stock',
      type: 'warning',
      title: 'Stock Bajo',
      message: `${lowStockItems.length} productos por debajo del punto de reorden`,
      timestamp: new Date(),
      icon: AlertTriangle
    });
  }

  // Verificar ventas recientes
  const recentSales = mockSales.filter(sale => {
    const saleDate = new Date(sale.fechaISO);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  if (recentSales.length > 0) {
    const totalToday = recentSales.reduce((sum, sale) => sum + sale.total, 0);
    notifications.push({
      id: 'sales-today',
      type: 'success',
      title: 'Ventas del Día',
      message: `${recentSales.length} ventas realizadas hoy por $${totalToday.toFixed(2)}`,
      timestamp: new Date(),
      icon: ShoppingCart
    });
  }

  // Notificación de inventario
  notifications.push({
    id: 'inventory-check',
    type: 'info',
    title: 'Revisión de Inventario',
    message: 'Recuerda revisar el inventario semanalmente',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    icon: Package
  });

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
      case 'success':
        return 'text-success';
      default:
        return 'text-foreground';
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/10';
      case 'info':
        return 'bg-info/10';
      case 'success':
        return 'bg-success/10';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notificaciones</h3>
        </div>
        {notifications.length > 0 && (
          <Badge variant="destructive" className="rounded-full">
            {notifications.length}
          </Badge>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No tienes notificaciones nuevas
            </p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification, index) => {
              const Icon = notification.icon;
              return (
                <div key={notification.id}>
                  <div 
                    className={`p-3 rounded-lg ${getNotificationBgColor(notification.type)} mb-2 hover:opacity-80 transition-opacity cursor-pointer`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button 
              variant="ghost" 
              className="w-full text-sm" 
              size="sm"
              aria-label="Marcar todas las notificaciones como leídas"
            >
              Marcar todas como leídas
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

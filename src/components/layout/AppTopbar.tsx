import { useState, useMemo } from "react";
import { Search, Moon, Sun, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Warehouse, User } from "../../types";
import { NotificationsPanel } from "./NotificationsPanel";

interface AppTopbarProps {
  breadcrumbs: Array<{ label: string; href?: string }>;
  warehouses: Warehouse[];
  currentWarehouse: string;
  onWarehouseChange: (warehouseId: string) => void;
  currentUser: User | null;
  onRoleChange: (role: 'admin' | 'gerente' | 'cajero') => void;
  onSearch: (query: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function AppTopbar({
  breadcrumbs,
  warehouses,
  currentWarehouse,
  onWarehouseChange,
  currentUser,
  onRoleChange,
  onSearch,
  isDarkMode,
  onToggleDarkMode,
}: AppTopbarProps) {
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const breadcrumbNames: Record<string, string> = {
    dashboard: 'Dashboard',
    ventas: 'Ventas',
    inventario: 'Inventario',
    compras: 'Compras',
    prediccion: 'Predicción',
    proveedores: 'Proveedores',
    equipos: 'Equipos',
    soporte: 'Soporte',
    configuracion: 'Configuración'
  };

  const dynamicBreadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(x => x);
    return pathnames.map((name, index) => ({
      label: breadcrumbNames[name] || name,
      href: index < pathnames.length - 1 ? `/${pathnames.slice(0, index + 1).join('/')}` : undefined
    }));
  }, [location.pathname]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'gerente': return 'secondary';
      case 'cajero': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center gap-2 md:gap-4 px-2 md:px-4">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="flex-shrink-0" />

        {/* Breadcrumbs */}
        <div className="flex-1 min-w-0 py-1">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap">
              {dynamicBreadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.href && index < dynamicBreadcrumbs.length - 1 ? (
                      <BreadcrumbLink href={crumb.href} className="truncate max-w-[200px]">
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="truncate max-w-[300px]">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0 w-80 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos, SKU... (Ctrl+/)"
            className="pl-10"
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                e.currentTarget.focus();
              }
            }}
          />
        </div>

        {/* Warehouse Selector */}
        <Select value={currentWarehouse} onValueChange={onWarehouseChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sucursal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Sucursales</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role Simulator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rol:</span>
          <Select 
            value={currentUser?.role || 'cajero'} 
            onValueChange={onRoleChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="gerente">Gerente</SelectItem>
              <SelectItem value="cajero">Cajero</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant={getRoleBadgeVariant(currentUser?.role || 'cajero')}>
            {currentUser?.role || 'cajero'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            aria-label="Cambiar modo oscuro"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notificaciones" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0 bg-card border-border shadow-lg" 
              align="end"
              sideOffset={8}
            >
              <NotificationsPanel />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
import { useState } from "react";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ShoppingBag,
  Settings,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Users,
  Truck,
  LifeBuoy
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";

const mainNavItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    description: "Resumen general del sistema"
  },
  { 
    title: "Inventario", 
    url: "/dashboard/inventario", 
    icon: Package,
    description: "Gestión de productos y stock"
  },
  { 
    title: "Ventas", 
    url: "/dashboard/ventas", 
    icon: ShoppingCart,
    description: "Registro y consulta de ventas"
  },
  { 
    title: "Predicción", 
    url: "/dashboard/prediccion", 
    icon: TrendingUp,
    description: "Pronósticos de demanda"
  },
  { 
    title: "Compra Sugerida", 
    url: "/dashboard/compras", 
    icon: ShoppingBag,
    description: "Sugerencias de reabastecimiento"
  },
  { 
    title: "Equipos", 
    url: "/dashboard/equipos", 
    icon: Users,
    description: "Gestión de equipos de trabajo"
  },
  { 
    title: "Proveedores", 
    url: "/dashboard/proveedores", 
    icon: Truck,
    description: "Directorio de proveedores"
  },
  { 
    title: "Configuración", 
    url: "/dashboard/configuracion", 
    icon: Settings,
    description: "Preferencias del sistema"
  },
  { 
    title: "Soporte", 
    url: "/dashboard/soporte", 
    icon: LifeBuoy,
    description: "Tickets y ayuda"
  },
];

interface AppSidebarProps {
  currentUser: User | null;
  onLogout: () => void;
}

export function AppSidebar({ currentUser, onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    // Para el dashboard principal, solo activar si es exactamente esa ruta
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    // Para otras rutas, activar si coincide exactamente o es una subruta
    return currentPath === path || currentPath.startsWith(path + '/');
  };
  
  const getNavClass = (url: string) => {
    const baseClass = "w-full justify-start transition-colors duration-200 py-4 px-3";
    return isActive(url) 
      ? `${baseClass} sidebar-item-active` 
      : `${baseClass} sidebar-item`;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={collapsed ? "p-3" : "p-4"}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-10 h-10 min-w-[2.5rem] bg-primary rounded-lg flex items-center justify-center touch-target" aria-label="Logo AutoParts Pro">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">AutoParts Pro</h2>
              <p className="text-sm text-muted-foreground truncate">Sistema de refaccionaria</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={collapsed ? "px-1" : "px-2"}>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={collapsed ? "gap-3" : "gap-2"}>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClass(item.url)} touch-target min-h-[44px] ${collapsed ? "justify-center" : ""}`}
                    >
                      <item.icon className={collapsed ? "w-6 h-6" : "w-5 h-5 min-w-[1.25rem]"} />
                      {!collapsed && (
                        <div className="flex flex-col items-start gap-0.5 min-w-0">
                          <span className="font-medium truncate w-full">{item.title}</span>
                          <span className="text-xs text-muted-foreground leading-tight line-clamp-1">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className={collapsed ? "p-2" : "p-4"}>
        {currentUser && (
          <div className={collapsed ? "flex justify-center mb-2" : "bg-secondary rounded-lg p-3 mb-2"}>
            {collapsed ? (
              <div className="w-10 h-10 min-w-[2.5rem] bg-primary rounded-full flex items-center justify-center touch-target">
                <UserIcon className="w-5 h-5 text-primary-foreground" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 min-w-[2.5rem] bg-primary rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {currentUser.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={onLogout}
          className={`w-full touch-target min-h-[44px] ${collapsed ? "justify-center" : "justify-start"}`}
          title={collapsed ? "Cerrar Sesión" : undefined}
          aria-label="Cerrar sesión"
        >
          <LogOut className={collapsed ? "w-5 h-5" : "w-4 h-4 min-w-[1rem]"} />
          {!collapsed && <span>Cerrar Sesión</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
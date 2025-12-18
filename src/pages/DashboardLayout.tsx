import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/layout/AppSidebar';
import { AppTopbar } from '../components/layout/AppTopbar';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mockWarehouses } from '../data/mockData';
import { toast } from '@/hooks/use-toast';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/inventario': 'Inventario',
  '/dashboard/ventas': 'Ventas', 
  '/dashboard/prediccion': 'Predicción de Ventas',
  '/dashboard/compras': 'Compra Sugerida',
  '/dashboard/equipos': 'Equipos',
  '/dashboard/proveedores': 'Proveedores',
  '/dashboard/configuracion': 'Configuración',
  '/dashboard/soporte': 'Soporte'
};

export function DashboardLayout() {
  const { currentUser, updateUserRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentWarehouse, setCurrentWarehouse] = useLocalStorage('autoparts_warehouse', 'w1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('autoparts_dark_mode', false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Generate breadcrumbs based on current route
  const generateBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Panel de Control', href: '/' }];
    
    let currentPath = '';
    pathParts.forEach((part) => {
      // Skip "dashboard" as it's just a technical route, not a navigation level
      if (part === 'dashboard') {
        currentPath += `/${part}`;
        return;
      }
      
      currentPath += `/${part}`;
      const label = routeLabels[currentPath] || part;
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
    navigate('/login');
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setCurrentWarehouse(warehouseId);
    if (warehouseId === 'all') {
      toast({
        title: "Vista global",
        description: "Mostrando información de todas las sucursales",
      });
    } else {
      const warehouse = mockWarehouses.find(w => w.id === warehouseId);
      toast({
        title: "Sucursal cambiada",
        description: `Ahora trabajando en ${warehouse?.nombre}`,
      });
    }
  };

  const handleRoleChange = (role: 'admin' | 'gerente' | 'cajero') => {
    updateUserRole(role);
    toast({
      title: "Rol simulado cambiado",
      description: `Ahora trabajando como ${role}`,
    });
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would trigger a search action
    // For now, we'll just store it in state
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcut (Ctrl+/ or Cmd+/)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Navigation shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        return;
      }

      if (e.key === 'g' && (e.ctrlKey || e.metaKey)) {
        // Handle "g" followed by letter shortcuts
        const handleSecondKey = (e2: KeyboardEvent) => {
          switch (e2.key) {
            case 'd':
              navigate('/dashboard');
              break;
            case 'i':
              navigate('/dashboard/inventario');
              break;
            case 'v':
              navigate('/dashboard/ventas');
              break;
            case 'p':
              navigate('/dashboard/prediccion');
              break;
            case 'c':
              navigate('/dashboard/compras');
              break;
          }
          document.removeEventListener('keydown', handleSecondKey);
        };
        
        document.addEventListener('keydown', handleSecondKey);
        
        // Remove listener after 2 seconds
        setTimeout(() => {
          document.removeEventListener('keydown', handleSecondKey);
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!currentUser) {
    return null; // This should be handled by the route protection
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar currentUser={currentUser} onLogout={handleLogout} />
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <AppTopbar
            breadcrumbs={generateBreadcrumbs()}
            warehouses={mockWarehouses}
            currentWarehouse={currentWarehouse}
            onWarehouseChange={handleWarehouseChange}
            currentUser={currentUser}
            onRoleChange={handleRoleChange}
            onSearch={handleSearch}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
          
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            <Outlet context={{ 
              currentWarehouse, 
              searchQuery, 
              currentUser 
            }} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
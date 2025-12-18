import { createContext, useContext, ReactNode } from 'react';
import { 
  mockProducts, 
  mockSales, 
  mockInventory, 
  mockWarehouses, 
  mockUsers,
  mockSuppliers,
  mockTeams,
  mockTickets,
  mockTicketComments,
  getProductById,
  getWarehouseById
} from '@/data/mockData';
import { Product, Sale, Inventory, Warehouse, User, Supplier, Team, Ticket, TicketComment } from '@/types';

interface DataContextType {
  products: Product[];
  sales: Sale[];
  inventory: Inventory[];
  warehouses: Warehouse[];
  users: User[];
  suppliers: Supplier[];
  teams: Team[];
  tickets: Ticket[];
  ticketComments: TicketComment[];
  getProductById: (id: string) => Product | undefined;
  getWarehouseById: (id: string) => Warehouse | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Runtime validation in development mode
  if (import.meta.env.DEV) {
    if (!Array.isArray(mockProducts) || mockProducts.length === 0) {
      console.warn('[DataContext] mockProducts está vacío o no es array');
    }
    if (!Array.isArray(mockSales) || mockSales.length === 0) {
      console.warn('[DataContext] mockSales está vacío o no es array');
    }
    if (!Array.isArray(mockInventory) || mockInventory.length === 0) {
      console.warn('[DataContext] mockInventory está vacío o no es array');
    }
    if (!Array.isArray(mockWarehouses) || mockWarehouses.length === 0) {
      console.warn('[DataContext] mockWarehouses está vacío o no es array');
    }
    if (!Array.isArray(mockUsers) || mockUsers.length === 0) {
      console.warn('[DataContext] mockUsers está vacío o no es array');
    }
    if (!Array.isArray(mockSuppliers) || mockSuppliers.length === 0) {
      console.warn('[DataContext] mockSuppliers está vacío o no es array');
    }
  }

  const value: DataContextType = {
    products: mockProducts,
    sales: mockSales,
    inventory: mockInventory,
    warehouses: mockWarehouses,
    users: mockUsers,
    suppliers: mockSuppliers,
    teams: mockTeams,
    tickets: mockTickets,
    ticketComments: mockTicketComments,
    getProductById,
    getWarehouseById,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

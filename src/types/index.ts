// Core data types for the refaccionaria platform

export interface Product {
  id: string;
  sku: string;
  nombre: string;
  marca: string;
  categoria: string;
  unidad: string;
  precio: number;
  iva: number;
  reorderPoint: number;
  safetyStock: number;
  descripcion?: string;
}

export interface Warehouse {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
}

export interface Inventory {
  productId: string;
  warehouseId: string;
  onHand: number;
  reserved: number;
  lastUpdated: string;
}

export interface SaleItem {
  productId: string;
  qty: number;
  unitPrice: number;
  discount?: number;
}

export interface Sale {
  id: string;
  fechaISO: string;
  warehouseId: string;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
  total: number;
  subtotal: number;
  iva: number;
  items: SaleItem[];
  vendedor?: string;
  cliente?: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  role: 'admin' | 'gerente' | 'cajero';
  warehouseId?: string;
}

export interface KPIData {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  format?: 'currency' | 'percentage' | 'number';
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ForecastData {
  productId: string;
  warehouseId: string;
  historical: ChartDataPoint[];
  forecast: ChartDataPoint[];
  confidence: {
    upper: ChartDataPoint[];
    lower: ChartDataPoint[];
  };
  mae?: number;
  mape?: number;
}

export interface PurchaseSuggestion {
  productId: string;
  warehouseId: string;
  onHand: number;
  reorderPoint: number;
  demandaEsperada: number;
  coberturaDias: number;
  qtySugerida: number;
  costo?: number;
}

export interface Team {
  id: string;
  nombre: string;
  descripcion?: string;
  lider?: string;
  miembros: string[];
  warehouseId?: string;
  fechaCreacion: string;
}

export interface Supplier {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion?: string;
  rfc?: string;
  categorias: string[];
  activo: boolean;
}

export interface FilterState {
  search: string;
  marca: string;
  categoria: string;
  warehouse: string;
  dateFrom?: string;
  dateTo?: string;
  metodoPago?: string;
}

export type TicketStatus = 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
export type TicketPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type TicketCategory = 'bug' | 'consulta' | 'sugerencia' | 'soporte' | 'reporte';

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: TicketCategory;
  prioridad: TicketPriority;
  estado: TicketStatus;
  userId: string;
  usuarioNombre: string;
  asignadoA?: string;
  archivosAdjuntos?: string[];
  metadata?: {
    navegador?: string;
    dispositivo?: string;
    url?: string;
  };
  createdAt: string;
  updatedAt: string;
  resueltoAt?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  usuarioNombre: string;
  contenido: string;
  esRespuestaOficial: boolean;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  currentWarehouse: string;
  products: Product[];
  warehouses: Warehouse[];
  inventory: Inventory[];
  sales: Sale[];
  filters: FilterState;
}
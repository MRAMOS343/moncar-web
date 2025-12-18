import { Product, Warehouse, Inventory, Sale, User, Team, Supplier, Ticket, TicketComment } from '../types';

// Mock warehouses (sucursales)
export const mockWarehouses: Warehouse[] = [
  { id: 'w1', nombre: 'Sucursal 1', direccion: 'Av. Principal 123', telefono: '555-0001' },
  { id: 'w2', nombre: 'Sucursal 2', direccion: 'Calle Norte 456', telefono: '555-0002' },
  { id: 'w3', nombre: 'Sucursal 3', direccion: 'Blvd. Sur 789', telefono: '555-0003' },
  { id: 'w4', nombre: 'Sucursal 4', direccion: 'Av. Este 321', telefono: '555-0004' },
  { id: 'w5', nombre: 'Sucursal 5', direccion: 'Calle Oeste 654', telefono: '555-0005' },
];

// Mock users
export const mockUsers: User[] = [
  { id: 'u1', nombre: 'Admin Sistema', email: 'admin@refaccionaria.com', role: 'admin' },
  { id: 'u2', nombre: 'Carlos Gerente', email: 'carlos@refaccionaria.com', role: 'gerente', warehouseId: 'w1' },
  { id: 'u3', nombre: 'María Cajera', email: 'maria@refaccionaria.com', role: 'cajero', warehouseId: 'w1' },
];

// Mock products - typical auto parts
export const mockProducts: Product[] = [
  {
    id: 'p1',
    sku: 'BUJ001',
    nombre: 'Bujía NGK Platino',
    marca: 'NGK',
    categoria: 'Encendido',
    unidad: 'pieza',
    precio: 85.50,
    iva: 16,
    reorderPoint: 20,
    safetyStock: 10,
    descripcion: 'Bujía de platino para motores a gasolina'
  },
  {
    id: 'p2',
    sku: 'FLT001',
    nombre: 'Filtro de Aceite Fram',
    marca: 'Fram',
    categoria: 'Filtros',
    unidad: 'pieza',
    precio: 125.00,
    iva: 16,
    reorderPoint: 15,
    safetyStock: 8,
    descripcion: 'Filtro de aceite para motor'
  },
  {
    id: 'p3',
    sku: 'BAL001',
    nombre: 'Balatas Delanteras Akebono',
    marca: 'Akebono',
    categoria: 'Frenos',
    unidad: 'juego',
    precio: 450.00,
    iva: 16,
    reorderPoint: 10,
    safetyStock: 5,
    descripcion: 'Balatas delanteras para frenos de disco'
  },
  {
    id: 'p4',
    sku: 'ACE001',
    nombre: 'Aceite Motor 5W-30 Mobil 1',
    marca: 'Mobil',
    categoria: 'Lubricantes',
    unidad: 'litro',
    precio: 89.90,
    iva: 16,
    reorderPoint: 50,
    safetyStock: 25,
    descripcion: 'Aceite sintético para motor'
  },
  {
    id: 'p5',
    sku: 'BAT001',
    nombre: 'Batería LTH L-42-650',
    marca: 'LTH',
    categoria: 'Eléctrico',
    unidad: 'pieza',
    precio: 1250.00,
    iva: 16,
    reorderPoint: 5,
    safetyStock: 3,
    descripcion: 'Batería 12V 42Ah'
  },
  {
    id: 'p6',
    sku: 'LIM001',
    nombre: 'Limpiaparabrisas Bosch',
    marca: 'Bosch',
    categoria: 'Accesorios',
    unidad: 'par',
    precio: 195.00,
    iva: 16,
    reorderPoint: 12,
    safetyStock: 6,
    descripcion: 'Plumas limpiaparabrisas universales'
  },
  {
    id: 'p7',
    sku: 'AMO001',
    nombre: 'Amortiguador Monroe',
    marca: 'Monroe',
    categoria: 'Suspensión',
    unidad: 'pieza',
    precio: 890.00,
    iva: 16,
    reorderPoint: 8,
    safetyStock: 4,
    descripcion: 'Amortiguador hidráulico delantero'
  },
  {
    id: 'p8',
    sku: 'BAN001',
    nombre: 'Banda Serpentín Gates',
    marca: 'Gates',
    categoria: 'Motor',
    unidad: 'pieza',
    precio: 320.00,
    iva: 16,
    reorderPoint: 15,
    safetyStock: 8,
    descripcion: 'Banda serpentín para accesorios del motor'
  },
  {
    id: 'p9',
    sku: 'RAD001',
    nombre: 'Radiador Completo',
    marca: 'Valeo',
    categoria: 'Enfriamiento',
    unidad: 'pieza',
    precio: 2150.00,
    iva: 16,
    reorderPoint: 3,
    safetyStock: 2,
    descripcion: 'Radiador de aluminio con tanques plásticos'
  },
  {
    id: 'p10',
    sku: 'ROM001',
    nombre: 'Rótula Suspension TRW',
    marca: 'TRW',
    categoria: 'Suspensión',
    unidad: 'pieza',
    precio: 275.00,
    iva: 16,
    reorderPoint: 10,
    safetyStock: 5,
    descripcion: 'Rótula de suspensión delantera'
  }
];

// Generate mock inventory for all products across all warehouses
export const mockInventory: Inventory[] = [];
mockProducts.forEach(product => {
  mockWarehouses.forEach(warehouse => {
    const baseStock = Math.floor(Math.random() * 100) + 10;
    mockInventory.push({
      productId: product.id,
      warehouseId: warehouse.id,
      onHand: baseStock,
      reserved: Math.floor(Math.random() * 5),
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  });
});

// Generate mock sales for the last 30 days
export const mockSales: Sale[] = [];
const today = new Date();
const metodoPagoOptions: Sale['metodoPago'][] = ['efectivo', 'tarjeta', 'transferencia', 'credito'];

for (let i = 0; i < 150; i++) {
  const saleDate = new Date(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  const warehouseId = mockWarehouses[Math.floor(Math.random() * mockWarehouses.length)].id;
  const metodoPago = metodoPagoOptions[Math.floor(Math.random() * metodoPagoOptions.length)];
  
  // Generate 1-3 items per sale
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let subtotal = 0;
  
  for (let j = 0; j < itemCount; j++) {
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const qty = Math.floor(Math.random() * 3) + 1;
    const unitPrice = product.precio;
    const discount = Math.random() > 0.8 ? Math.random() * 0.1 : 0;
    
    items.push({
      productId: product.id,
      qty,
      unitPrice,
      discount
    });
    
    subtotal += qty * unitPrice * (1 - discount);
  }
  
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  
  mockSales.push({
    id: `s${i + 1}`,
    fechaISO: saleDate.toISOString(),
    warehouseId,
    metodoPago,
    subtotal: Math.round(subtotal * 100) / 100,
    iva: Math.round(iva * 100) / 100,
    total: Math.round(total * 100) / 100,
    items,
    vendedor: mockUsers[Math.floor(Math.random() * mockUsers.length)].nombre
  });
}

// Mock teams
export const mockTeams: Team[] = [
  {
    id: 't1',
    nombre: 'Equipo Ventas Norte',
    descripcion: 'Equipo de ventas para sucursales del norte',
    lider: 'Carlos Gerente',
    miembros: ['María Cajera', 'Juan Pérez', 'Ana López'],
    warehouseId: 'w1',
    fechaCreacion: '2024-01-15'
  },
  {
    id: 't2',
    nombre: 'Equipo Inventario',
    descripcion: 'Equipo encargado del control de inventario',
    lider: 'Roberto Sánchez',
    miembros: ['Pedro Martínez', 'Laura García', 'Miguel Torres'],
    fechaCreacion: '2024-02-10'
  },
  {
    id: 't3',
    nombre: 'Equipo Compras',
    descripcion: 'Equipo de gestión de compras y proveedores',
    lider: 'Gabriela Hernández',
    miembros: ['José Ramírez', 'Carmen Flores'],
    warehouseId: 'w2',
    fechaCreacion: '2024-03-05'
  },
  {
    id: 't4',
    nombre: 'Equipo Ventas Sur',
    descripcion: 'Equipo de ventas para sucursales del sur',
    lider: 'Fernando Morales',
    miembros: ['Diana Cruz', 'Ricardo Méndez', 'Patricia Ruiz', 'Alberto Reyes'],
    warehouseId: 'w3',
    fechaCreacion: '2024-01-20'
  }
];

// Mock suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    nombre: 'Autopartes del Bajío S.A. de C.V.',
    contacto: 'Ing. Roberto González',
    telefono: '555-1234-567',
    email: 'ventas@autopartesbajio.com.mx',
    direccion: 'Av. Industria 456, León, Guanajuato',
    rfc: 'ADB890123-ABC',
    categorias: ['Frenos', 'Suspensión'],
    activo: true
  },
  {
    id: 's2',
    nombre: 'Distribuidora Nacional de Refacciones',
    contacto: 'Lic. María Guadalupe Ramírez',
    telefono: '555-9876-543',
    email: 'contacto@dnr.com.mx',
    direccion: 'Calzada Tlalpan 890, Ciudad de México',
    rfc: 'DNR780456-XYZ',
    categorias: ['Filtros', 'Lubricantes', 'Eléctrico'],
    activo: true
  },
  {
    id: 's3',
    nombre: 'Importadora Gómez Hermanos',
    contacto: 'Sr. José Luis Gómez',
    telefono: '555-4567-890',
    email: 'jlgomez@gomezhermanos.mx',
    direccion: 'Boulevard Díaz Ordaz 234, Monterrey, Nuevo León',
    rfc: 'IGH560789-DEF',
    categorias: ['Motor', 'Encendido'],
    activo: true
  },
  {
    id: 's4',
    nombre: 'Refacciones Martínez del Pacífico',
    contacto: 'Ing. Carmen Martínez Vega',
    telefono: '555-3456-789',
    email: 'ventas@rmpacífico.com',
    direccion: 'Av. Marina Nacional 567, Guadalajara, Jalisco',
    rfc: 'RMP670234-GHI',
    categorias: ['Enfriamiento', 'Accesorios'],
    activo: true
  },
  {
    id: 's5',
    nombre: 'Distribuidora de Autopartes Hernández',
    contacto: 'Sr. Pedro Hernández Castro',
    telefono: '555-8765-432',
    email: 'info@dah-refacciones.mx',
    direccion: 'Calle Reforma 123, Puebla, Puebla',
    rfc: 'DAH450123-JKL',
    categorias: ['Frenos', 'Eléctrico', 'Motor'],
    activo: true
  },
  {
    id: 's6',
    nombre: 'Proveedora Industrial del Norte',
    contacto: 'Lic. Ana Laura Torres',
    telefono: '555-2345-678',
    email: 'atorres@pinnorte.com.mx',
    direccion: 'Parque Industrial 789, Saltillo, Coahuila',
    rfc: 'PIN340567-MNO',
    categorias: ['Suspensión', 'Motor', 'Filtros'],
    activo: false
  }
];

// Utility functions for data manipulation
export const getProductById = (id: string): Product | undefined => 
  mockProducts.find(p => p.id === id);

export const getWarehouseById = (id: string): Warehouse | undefined => 
  mockWarehouses.find(w => w.id === id);

export const getInventoryForProduct = (productId: string, warehouseId?: string): Inventory[] => 
  mockInventory.filter(inv => 
    inv.productId === productId && 
    (warehouseId ? inv.warehouseId === warehouseId : true)
  );

export const getInventoryForWarehouse = (warehouseId: string): Inventory[] => 
  mockInventory.filter(inv => inv.warehouseId === warehouseId);

export const getSalesForWarehouse = (warehouseId: string, dateFrom?: Date, dateTo?: Date): Sale[] => 
  mockSales.filter(sale => {
    if (sale.warehouseId !== warehouseId) return false;
    if (dateFrom && new Date(sale.fechaISO) < dateFrom) return false;
    if (dateTo && new Date(sale.fechaISO) > dateTo) return false;
    return true;
  });

export const getTeamById = (id: string): Team | undefined => 
  mockTeams.find(t => t.id === id);

export const getSupplierById = (id: string): Supplier | undefined => 
  mockSuppliers.find(s => s.id === id);

// Mock tickets
export const mockTickets: Ticket[] = [
  {
    id: 'tk1',
    titulo: 'Error al generar reporte de ventas',
    descripcion: 'Cuando intento generar el reporte de ventas del mes, la página se congela y no responde.',
    categoria: 'bug',
    prioridad: 'alta',
    estado: 'en_progreso',
    userId: 'u2',
    usuarioNombre: 'Carlos Gerente',
    asignadoA: 'Admin Sistema',
    metadata: {
      navegador: 'Chrome 120.0',
      dispositivo: 'Desktop',
      url: '/dashboard/ventas'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tk2',
    titulo: '¿Cómo exportar el inventario a Excel?',
    descripcion: 'Necesito exportar todo el inventario de mi sucursal a Excel para hacer un análisis externo. ¿Hay alguna forma de hacerlo?',
    categoria: 'consulta',
    prioridad: 'media',
    estado: 'resuelto',
    userId: 'u3',
    usuarioNombre: 'María Cajera',
    asignadoA: 'Admin Sistema',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    resueltoAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tk3',
    titulo: 'Sugerencia: Modo oscuro',
    descripcion: 'Sería genial tener un modo oscuro para trabajar de noche sin cansar la vista.',
    categoria: 'sugerencia',
    prioridad: 'baja',
    estado: 'cerrado',
    userId: 'u2',
    usuarioNombre: 'Carlos Gerente',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    resueltoAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tk4',
    titulo: 'No puedo acceder a compras sugeridas',
    descripcion: 'Me aparece un error 403 cuando intento entrar a la sección de compras sugeridas.',
    categoria: 'soporte',
    prioridad: 'alta',
    estado: 'abierto',
    userId: 'u3',
    usuarioNombre: 'María Cajera',
    metadata: {
      navegador: 'Firefox 121.0',
      dispositivo: 'Desktop',
      url: '/dashboard/compras'
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tk5',
    titulo: 'Reporte: Precios desactualizados en catálogo',
    descripcion: 'Varios productos muestran precios que no coinciden con nuestra lista actual. Adjunto lista de SKUs afectados.',
    categoria: 'reporte',
    prioridad: 'urgente',
    estado: 'abierto',
    userId: 'u2',
    usuarioNombre: 'Carlos Gerente',
    metadata: {
      navegador: 'Safari 17.1',
      dispositivo: 'iPad',
      url: '/dashboard/inventario'
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
];

// Mock ticket comments
export const mockTicketComments: TicketComment[] = [
  {
    id: 'tc1',
    ticketId: 'tk1',
    userId: 'u2',
    usuarioNombre: 'Carlos Gerente',
    contenido: 'El problema ocurre específicamente cuando selecciono un rango de fechas mayor a 90 días.',
    esRespuestaOficial: false,
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tc2',
    ticketId: 'tk1',
    userId: 'u1',
    usuarioNombre: 'Admin Sistema',
    contenido: 'Gracias por el detalle. Estamos trabajando en optimizar la consulta para rangos grandes. Mientras tanto, intenta dividirlo en periodos más cortos.',
    esRespuestaOficial: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tc3',
    ticketId: 'tk2',
    userId: 'u1',
    usuarioNombre: 'Admin Sistema',
    contenido: 'Hola María, puedes usar el botón "Exportar" en la parte superior derecha de la tabla de inventario. Te generará un archivo Excel con todos los datos.',
    esRespuestaOficial: true,
    createdAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tc4',
    ticketId: 'tk2',
    userId: 'u3',
    usuarioNombre: 'María Cajera',
    contenido: '¡Perfecto! Ya lo encontré. Muchas gracias.',
    esRespuestaOficial: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tc5',
    ticketId: 'tk3',
    userId: 'u1',
    usuarioNombre: 'Admin Sistema',
    contenido: '¡Excelente sugerencia! Ya implementamos el modo oscuro. Puedes activarlo desde el menú de usuario en la esquina superior derecha.',
    esRespuestaOficial: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const getTicketById = (id: string): Ticket | undefined => 
  mockTickets.find(t => t.id === id);

export const getTicketComments = (ticketId: string): TicketComment[] => 
  mockTicketComments.filter(c => c.ticketId === ticketId);

export const getTicketsForUser = (userId: string): Ticket[] => 
  mockTickets.filter(t => t.userId === userId);
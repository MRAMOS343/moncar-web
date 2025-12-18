// Constantes globales de la aplicación

export const CATEGORIAS_PRODUCTO = [
  "Motor", 
  "Suspensión", 
  "Frenos", 
  "Transmisión", 
  "Eléctrico", 
  "Carrocería", 
  "Filtros", 
  "Lubricantes", 
  "Llantas", 
  "Accesorios"
] as const;

export const UNIDADES_MEDIDA = [
  "pza", 
  "kit", 
  "par", 
  "litro", 
  "galón", 
  "metro", 
  "caja", 
  "juego"
] as const;

export const METODOS_PAGO = [
  'efectivo', 
  'tarjeta', 
  'transferencia', 
  'credito'
] as const;

export const ROLES_USUARIO = [
  'admin', 
  'gerente', 
  'cajero'
] as const;

export const TICKET_CATEGORIAS = [
  'bug', 
  'consulta', 
  'sugerencia', 
  'soporte', 
  'reporte'
] as const;

export const TICKET_PRIORIDADES = [
  'baja', 
  'media', 
  'alta', 
  'urgente'
] as const;

export const TICKET_ESTADOS = [
  'abierto', 
  'en_progreso', 
  'resuelto', 
  'cerrado'
] as const;

export const COLORES_GRAFICOS = [
  '#3B82F6', 
  '#10B981', 
  '#F59E0B', 
  '#EF4444', 
  '#F97316'
] as const;

export const IVA_PREDETERMINADO = 16;

export const RANGOS_FECHA = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
} as const;

export const STOCK_STATUS = {
  BAJO: 'bajo',
  MEDIO: 'medio',
  ALTO: 'alto',
} as const;

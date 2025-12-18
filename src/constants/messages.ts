/**
 * Mensajes centralizados de la aplicación
 * Facilita i18n y consistencia en UX
 */

export const SUCCESS_MESSAGES = {
  PRODUCT_CREATED: (name: string) => `Producto "${name}" creado exitosamente`,
  PRODUCT_UPDATED: (name: string) => `Producto "${name}" actualizado exitosamente`,
  PRODUCT_DELETED: (name: string) => `Producto "${name}" eliminado exitosamente`,
  
  SALE_REGISTERED: (total: string) => `Venta por ${total} registrada exitosamente`,
  SALE_CANCELLED: "Venta cancelada exitosamente",
  
  EXPORT_SUCCESS: (type: string) => `Datos exportados a ${type} exitosamente`,
  IMPORT_SUCCESS: (count: number) => `${count} registros importados exitosamente`,
  
  TICKET_CREATED: "Ticket de soporte creado exitosamente",
  TICKET_UPDATED: "Ticket actualizado exitosamente",
  TICKET_CLOSED: "Ticket cerrado exitosamente",
  
  SETTINGS_SAVED: "Configuración guardada exitosamente",
  PROFILE_UPDATED: "Perfil actualizado exitosamente",
} as const;

export const ERROR_MESSAGES = {
  GENERIC: "Ha ocurrido un error. Por favor intenta nuevamente",
  NETWORK: "Error de conexión. Verifica tu conexión a internet",
  
  INVALID_FORM: "Por favor verifica los datos del formulario",
  REQUIRED_FIELDS: "Todos los campos marcados son obligatorios",
  
  PRODUCT_NOT_FOUND: "Producto no encontrado",
  INSUFFICIENT_STOCK: (available: number) => `Stock insuficiente. Disponible: ${available} unidades`,
  
  SALE_EMPTY: "Debes agregar al menos un producto a la venta",
  SALE_INVALID_QUANTITY: "La cantidad debe ser un número entre 1 y 9999",
  
  FILE_TOO_LARGE: (maxSize: number) => `El archivo excede el tamaño máximo de ${maxSize}MB`,
  INVALID_FILE_TYPE: (types: string) => `Tipo de archivo inválido. Permitidos: ${types}`,
  
  PERMISSION_DENIED: "No tienes permisos para realizar esta acción",
  SESSION_EXPIRED: "Tu sesión ha expirado. Por favor inicia sesión nuevamente",
} as const;

export const WARNING_MESSAGES = {
  LOW_STOCK: (product: string, quantity: number) => 
    `Stock bajo de "${product}": ${quantity} unidades restantes`,
  REORDER_POINT: (product: string) => 
    `"${product}" ha alcanzado el punto de reorden. Considera reabastecer`,
  
  UNSAVED_CHANGES: "Tienes cambios sin guardar. ¿Estás seguro de salir?",
  DELETE_CONFIRMATION: (item: string) => `¿Estás seguro de eliminar "${item}"? Esta acción no se puede deshacer`,
  
  LARGE_EXPORT: (count: number) => 
    `Vas a exportar ${count} registros. Esto puede tardar unos momentos`,
} as const;

export const INFO_MESSAGES = {
  LOADING: "Cargando datos...",
  SAVING: "Guardando...",
  PROCESSING: "Procesando...",
  SEARCHING: "Buscando...",
  
  NO_RESULTS: "No se encontraron resultados",
  NO_DATA: "No hay datos disponibles",
  
  FILTER_ACTIVE: (count: number) => `${count} filtros activos`,
  RESULTS_COUNT: (count: number) => `${count} resultado${count !== 1 ? 's' : ''}`,
  
  FORECAST_DISCLAIMER: "Las predicciones son estimaciones basadas en datos históricos",
  DEMO_MODE: "Modo demostración - Los cambios no se guardarán permanentemente",
} as const;

import { z } from "zod";
import { CATEGORIAS_PRODUCTO, UNIDADES_MEDIDA, METODOS_PAGO, TICKET_CATEGORIAS, TICKET_PRIORIDADES, TICKET_ESTADOS } from "@/constants";
import { LIMITS } from "@/constants/limits";

// ============= Product Schemas =============
export const productSchema = z.object({
  sku: z.string()
    .min(LIMITS.PRODUCT.SKU_MIN, "SKU es requerido")
    .max(LIMITS.PRODUCT.SKU_MAX, `SKU debe tener máximo ${LIMITS.PRODUCT.SKU_MAX} caracteres`)
    .regex(/^[A-Z0-9-]+$/i, "SKU solo puede contener letras, números y guiones")
    .trim(),
  nombre: z.string()
    .min(LIMITS.PRODUCT.NOMBRE_MIN, "Nombre es requerido")
    .max(LIMITS.PRODUCT.NOMBRE_MAX, `Nombre debe tener máximo ${LIMITS.PRODUCT.NOMBRE_MAX} caracteres`)
    .trim(),
  marca: z.string()
    .min(LIMITS.PRODUCT.MARCA_MIN, "Marca es requerida")
    .max(LIMITS.PRODUCT.MARCA_MAX, `Marca debe tener máximo ${LIMITS.PRODUCT.MARCA_MAX} caracteres`)
    .trim(),
  categoria: z.string().min(1, "Categoría es requerida"),
  unidad: z.string().min(1, "Unidad es requerida"),
  precio: z.number()
    .min(LIMITS.PRODUCT.PRECIO_MIN, "El precio debe ser mayor a 0")
    .max(LIMITS.PRODUCT.PRECIO_MAX, "El precio excede el límite permitido"),
  iva: z.number()
    .min(LIMITS.PRODUCT.IVA_MIN, "IVA no puede ser negativo")
    .max(LIMITS.PRODUCT.IVA_MAX, "IVA no puede ser mayor a 100%"),
  reorderPoint: z.number()
    .int("Punto de reorden debe ser un número entero")
    .min(LIMITS.PRODUCT.REORDER_MIN, "Punto de reorden no puede ser negativo")
    .max(LIMITS.PRODUCT.REORDER_MAX, "Punto de reorden excede el límite"),
  safetyStock: z.number()
    .int("Stock de seguridad debe ser un número entero")
    .min(LIMITS.PRODUCT.SAFETY_STOCK_MIN, "Stock de seguridad no puede ser negativo")
    .max(LIMITS.PRODUCT.SAFETY_STOCK_MAX, "Stock de seguridad excede el límite"),
  descripcion: z.string()
    .max(LIMITS.PRODUCT.DESCRIPCION_MAX, `Descripción debe tener máximo ${LIMITS.PRODUCT.DESCRIPCION_MAX} caracteres`)
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ============= Sale Schemas =============
export const saleItemSchema = z.object({
  productId: z.string().min(1, "Producto es requerido"),
  qty: z.number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser mayor a 0")
    .max(9999, "La cantidad no puede exceder 9999 unidades"),
  unitPrice: z.number()
    .min(0.01, "El precio debe ser mayor a 0")
    .max(999999.99, "El precio excede el límite permitido"),
  discount: z.number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor a 100%")
    .optional(),
});

export const saleSchema = z.object({
  metodoPago: z.enum(METODOS_PAGO, {
    required_error: "Método de pago es requerido",
  }),
  cliente: z.string().max(100, "Nombre del cliente debe tener máximo 100 caracteres").optional(),
  items: z.array(saleItemSchema).min(1, "Debe agregar al menos un producto"),
});

export type SaleFormData = z.infer<typeof saleSchema>;
export type SaleItemFormData = z.infer<typeof saleItemSchema>;

// ============= Ticket Schemas =============
export const ticketSchema = z.object({
  titulo: z.string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título debe tener máximo 100 caracteres")
    .trim(),
  descripcion: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción debe tener máximo 500 caracteres")
    .trim(),
  categoria: z.enum(TICKET_CATEGORIAS, {
    required_error: "Categoría es requerida",
  }),
  prioridad: z.enum(TICKET_PRIORIDADES, {
    required_error: "Prioridad es requerida",
  }),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

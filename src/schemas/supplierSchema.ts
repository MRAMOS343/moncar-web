import { z } from 'zod';

export const supplierSchema = z.object({
  nombre: z.string()
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/, { message: "Solo letras y espacios permitidos" }),
  
  contacto: z.string()
    .trim()
    .min(3, { message: "El contacto debe tener al menos 3 caracteres" })
    .max(100, { message: "El contacto no puede exceder 100 caracteres" }),
  
  telefono: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, { message: "Formato de teléfono inválido" })
    .min(10, { message: "El teléfono debe tener al menos 10 dígitos" })
    .max(20, { message: "El teléfono no puede exceder 20 caracteres" }),
  
  email: z.string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "El email no puede exceder 255 caracteres" }),
  
  direccion: z.string()
    .trim()
    .max(500, { message: "La dirección no puede exceder 500 caracteres" })
    .optional(),
  
  rfc: z.string()
    .trim()
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, { message: "RFC inválido (formato: ABC123456XYZ)" })
    .optional()
    .or(z.literal("")),
  
  categorias: z.string()
    .trim()
    .max(500, { message: "Las categorías no pueden exceder 500 caracteres" }),
  
  activo: z.boolean()
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

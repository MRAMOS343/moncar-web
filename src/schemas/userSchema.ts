import { z } from 'zod';

/**
 * Schema de validación para datos de usuario
 * Usado para validar localStorage y prevenir datos corruptos
 */
export const userSchema = z.object({
  id: z.string().min(1, "ID de usuario es requerido"),
  nombre: z.string().min(1, "Nombre es requerido"),
  email: z.string().email("Email inválido"),
  role: z.enum(['admin', 'gerente', 'cajero'], {
    errorMap: () => ({ message: "Rol inválido" })
  }),
  warehouseId: z.string().optional(),
});

export type UserSchemaType = z.infer<typeof userSchema>;

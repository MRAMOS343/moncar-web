import { z } from 'zod';

export const userProfileSchema = z.object({
  nombre: z.string()
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" }),
  
  email: z.string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "El email no puede exceder 255 caracteres" }),
  
  telefono: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, { message: "Formato de teléfono inválido" })
    .min(10, { message: "El teléfono debe tener al menos 10 dígitos" })
    .max(20, { message: "El teléfono no puede exceder 20 caracteres" })
    .optional()
    .or(z.literal(""))
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

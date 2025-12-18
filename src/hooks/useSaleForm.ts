import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LIMITS } from '@/constants/limits';

const saleFormSchema = z.object({
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia']),
  cliente: z.string().max(LIMITS.SALE.CLIENTE_MAX).optional(),
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;

/**
 * Hook para manejo del formulario de venta
 */
export function useSaleForm() {
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      metodoPago: 'efectivo',
      cliente: '',
    },
  });

  const resetForm = () => {
    form.reset();
    setEnviandoFormulario(false);
  };

  return {
    form,
    enviandoFormulario,
    setEnviandoFormulario,
    resetForm,
  };
}

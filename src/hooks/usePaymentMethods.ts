
import { useQuery } from '@tanstack/react-query';

interface PaymentMethod {
  id: string;
  name: string;
  currency: string;
  symbol: string;
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async (): Promise<PaymentMethod[]> => {
      // Métodos de pago que coinciden con los IDs usados en el sistema
      return [
        { id: 'efectivo', name: 'Efectivo', currency: 'MULTI', symbol: '$' },
        { id: 'transferencia', name: 'Transferencia', currency: 'MULTI', symbol: '$' },
        { id: 'tarjeta', name: 'Tarjeta', currency: 'MULTI', symbol: '$' },
        { id: 'otro', name: 'Otro', currency: 'MULTI', symbol: '$' }
      ];
    }
  });
}

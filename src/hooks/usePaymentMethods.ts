
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
      // Since payment_methods table doesn't exist, return hardcoded payment methods
      return [
        { id: '1', name: 'Efectivo COP', currency: 'COP', symbol: '$' },
        { id: '2', name: 'Efectivo AWG', currency: 'AWG', symbol: 'ƒ' },
        { id: '3', name: 'Transferencia COP', currency: 'COP', symbol: '$' },
        { id: '4', name: 'Transferencia AWG', currency: 'AWG', symbol: 'ƒ' }
      ];
    }
  });
}

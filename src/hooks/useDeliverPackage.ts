
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryPayment {
  method_id: string;
  amount: number;
  currency: string;
  type: 'full' | 'partial';
}

interface DeliverPackageParams {
  packageId: string;
  deliveredBy: string;
  payments?: DeliveryPayment[];
}

export function useDeliverPackage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ packageId, deliveredBy, payments }: DeliverPackageParams) => {
      const { data, error } = await supabase.rpc('deliver_package_with_payment', {
        p_package_id: packageId,
        p_delivered_by: deliveredBy,
        p_payments: payments ? JSON.stringify(payments) : null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
    }
  });
}

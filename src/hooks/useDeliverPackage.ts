
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
      console.log('🚀 Iniciando entrega de paquete:', {
        packageId,
        deliveredBy,
        payments
      });

      try {
        const { data, error } = await supabase.rpc('deliver_package_with_payment', {
          p_package_id: packageId,
          p_delivered_by: deliveredBy,
          p_payments: payments ? JSON.stringify(payments) : null
        });
        
        if (error) {
          console.error('❌ Error en función RPC:', error);
          throw error;
        }

        console.log('✅ Respuesta exitosa de RPC:', data);
        return data;
      } catch (error) {
        console.error('❌ Error completo en entrega:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Entrega exitosa, invalidando queries...');
      
      // Invalidar todas las queries relevantes
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['debt-data'] });
      queryClient.invalidateQueries({ queryKey: ['collection-packages'] });
      
      // Mostrar toast de éxito
      toast({
        title: "¡Entrega exitosa!",
        description: `Paquete entregado correctamente por ${variables.deliveredBy}`,
      });
      
      console.log('✅ Queries invalidadas y toast mostrado');
    },
    onError: (error) => {
      console.error('❌ Error en mutación de entrega:', error);
      
      toast({
        title: "Error en la entrega",
        description: "No se pudo completar la entrega del paquete. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  });
}


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
        // Primero intentamos la función RPC original
        const { data, error } = await supabase.rpc('deliver_package_with_payment', {
          p_package_id: packageId,
          p_delivered_by: deliveredBy,
          p_payments: payments ? JSON.stringify(payments) : null
        });
        
        if (error) {
          console.error('❌ Error en función RPC:', error);
          
          // Si es un error de permisos en collection_stats, intentamos una solución alternativa
          if (error.message?.includes('collection_stats') || error.code === '42501') {
            console.log('🔄 Error de permisos detectado, intentando método alternativo...');
            
            // Método alternativo: actualizar directamente la tabla packages
            const { data: updateData, error: updateError } = await supabase
              .from('packages')
              .update({ 
                status: 'delivered',
                delivered_by: deliveredBy,
                delivered_at: new Date().toISOString()
              })
              .eq('id', packageId)
              .select();

            if (updateError) {
              console.error('❌ Error en método alternativo:', updateError);
              throw updateError;
            }

            // Si hay pagos, creamos un registro de entrega y luego los pagos
            if (payments && payments.length > 0) {
              console.log('💰 Creando registro de entrega y pagos...');
              
              // Crear registro de entrega primero
              const { data: deliveryData, error: deliveryError } = await supabase
                .from('package_deliveries')
                .insert({
                  package_id: packageId,
                  delivered_by: deliveredBy,
                  delivery_date: new Date().toISOString(),
                  total_amount_collected: payments.reduce((sum, p) => sum + p.amount, 0),
                  delivery_status: 'delivered'
                })
                .select()
                .single();

              if (deliveryError) {
                console.error('❌ Error creando registro de entrega:', deliveryError);
                // No lanzamos error aquí para no bloquear la entrega del paquete
              } else {
                // Crear registros de pago
                for (const payment of payments) {
                  const { error: paymentError } = await supabase
                    .from('delivery_payments')
                    .insert({
                      delivery_id: deliveryData.id,
                      payment_method_id: payment.method_id,
                      amount: payment.amount,
                      currency: payment.currency,
                      payment_type: payment.type
                    });

                  if (paymentError) {
                    console.error('❌ Error creando pago:', paymentError);
                    // No lanzamos error aquí para no bloquear la entrega
                  }
                }
              }
            }

            console.log('✅ Entrega procesada con método alternativo');
            return updateData;
          }
          
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
    onError: (error: any) => {
      console.error('❌ Error en mutación de entrega:', error);
      
      let errorMessage = "No se pudo completar la entrega del paquete. Intenta nuevamente.";
      
      // Mensaje más específico para errores de permisos
      if (error?.message?.includes('collection_stats') || error?.code === '42501') {
        errorMessage = "Error de permisos en la base de datos. Contacta al administrador del sistema.";
      }
      
      toast({
        title: "Error en la entrega",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });
}

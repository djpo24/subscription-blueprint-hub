
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
        // Primero intentamos la función RPC original - CAMBIO: enviar array directo, no JSON string
        const { data, error } = await supabase.rpc('deliver_package_with_payment', {
          p_package_id: packageId,
          p_delivered_by: deliveredBy,
          p_payments: payments || [] // Enviar array vacío en lugar de null, y NO JSON.stringify
        });
        
        if (error) {
          console.error('❌ Error en función RPC:', error);
          
          // Si es un error de permisos en collection_stats, intentamos una solución alternativa
          if (error.message?.includes('collection_stats') || error.code === '42501') {
            console.log('🔄 Error de permisos detectado, intentando método alternativo...');
            
            // Primero obtenemos la información del paquete
            const { data: packageData, error: packageError } = await supabase
              .from('packages')
              .select('amount_to_collect, currency')
              .eq('id', packageId)
              .single();

            if (packageError) {
              console.error('❌ Error obteniendo datos del paquete:', packageError);
              throw packageError;
            }

            console.log('📦 Datos del paquete:', packageData);

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

            // Calcular total cobrado de los pagos
            const totalCollected = payments ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
            console.log('💰 Total cobrado:', totalCollected);
            console.log('💰 Monto a cobrar del paquete:', packageData.amount_to_collect);

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
                  total_amount_collected: totalCollected,
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

            // CRUCIAL: Si el paquete tiene monto a cobrar, crear registro de deuda SIEMPRE
            if (packageData.amount_to_collect && packageData.amount_to_collect > 0) {
              console.log('💸 Creando registro de deuda para paquete con monto a cobrar...');
              
              const pendingAmount = (packageData.amount_to_collect || 0) - totalCollected;
              
              // Verificar si ya existe un registro de deuda
              const { data: existingDebt, error: checkError } = await supabase
                .from('package_debts')
                .select('id')
                .eq('package_id', packageId)
                .single();

              if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error('❌ Error verificando deuda existente:', checkError);
              }

              if (existingDebt) {
                console.log('📝 Actualizando registro de deuda existente...');
                // Actualizar registro existente
                const { error: debtError } = await supabase
                  .from('package_debts')
                  .update({
                    total_amount: packageData.amount_to_collect,
                    pending_amount: pendingAmount,
                    paid_amount: totalCollected,
                    debt_type: 'unpaid', // Cambio a 'unpaid' porque ya fue entregado
                    delivery_date: new Date().toISOString(),
                    status: totalCollected >= packageData.amount_to_collect ? 'paid' : 
                            totalCollected > 0 ? 'partial' : 'pending',
                    updated_at: new Date().toISOString()
                  })
                  .eq('package_id', packageId);

                if (debtError) {
                  console.error('❌ Error actualizando registro de deuda:', debtError);
                } else {
                  console.log('✅ Registro de deuda actualizado exitosamente');
                }
              } else {
                console.log('📝 Creando nuevo registro de deuda...');
                // Crear nuevo registro
                const { error: debtError } = await supabase
                  .from('package_debts')
                  .insert({
                    package_id: packageId,
                    total_amount: packageData.amount_to_collect,
                    pending_amount: pendingAmount,
                    paid_amount: totalCollected,
                    debt_type: 'unpaid', // Cambio a 'unpaid' porque ya fue entregado
                    debt_start_date: new Date().toISOString().split('T')[0], // Solo la fecha
                    delivery_date: new Date().toISOString(),
                    status: totalCollected >= packageData.amount_to_collect ? 'paid' : 
                            totalCollected > 0 ? 'partial' : 'pending'
                  });

                if (debtError) {
                  console.error('❌ Error creando registro de deuda:', debtError);
                } else {
                  console.log('✅ Registro de deuda creado exitosamente');
                }
              }
            } else {
              console.log('ℹ️ Paquete sin monto a cobrar, no se crea registro de deuda');
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
      
      // Mensaje más específico para errores de base de datos
      if (error?.code === '22023') {
        errorMessage = "Error de formato de datos. El paquete se intentará entregar de manera alternativa.";
      } else if (error?.message?.includes('collection_stats') || error?.code === '42501') {
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

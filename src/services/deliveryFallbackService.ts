
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

export class DeliveryFallbackService {
  static async deliverPackageWithFallback({ packageId, deliveredBy, payments }: DeliverPackageParams) {
    console.log('🔄 [DeliveryFallbackService] Iniciando método alternativo de entrega:', {
      packageId,
      deliveredBy,
      payments
    });

    try {
      // PASO 1: Obtener información del paquete
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError) {
        console.error('❌ [DeliveryFallbackService] Error obteniendo paquete:', packageError);
        throw new Error('No se pudo obtener la información del paquete');
      }

      console.log('✅ [DeliveryFallbackService] Paquete obtenido:', packageData);

      // PASO 2: Actualizar el paquete a entregado (método simplificado)
      const { data: updatedPackage, error: updateError } = await supabase
        .from('packages')
        .update({
          status: 'delivered',
          delivered_by: deliveredBy,
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', packageId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [DeliveryFallbackService] Error actualizando paquete:', updateError);
        throw new Error('No se pudo actualizar el estado del paquete');
      }

      console.log('✅ [DeliveryFallbackService] Paquete actualizado:', updatedPackage);

      // PASO 3: Registrar evento de tracking
      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert({
          package_id: packageId,
          event_type: 'delivered',
          description: `Paquete entregado por ${deliveredBy} - Método alternativo`,
          location: packageData.destination || 'Destino'
        });

      if (trackingError) {
        console.warn('⚠️ [DeliveryFallbackService] Error creando evento de tracking:', trackingError);
        // No lanzar error, es secundario
      }

      // PASO 4: Registrar pagos si existen
      if (payments && payments.length > 0) {
        console.log('💰 [DeliveryFallbackService] Registrando pagos:', payments);
        
        for (const payment of payments) {
          const { error: paymentError } = await supabase
            .from('customer_payments')
            .insert({
              package_id: packageId,
              amount: payment.amount,
              currency: payment.currency,
              payment_method: payment.method_id,
              notes: `Pago registrado durante entrega - ${payment.type} - Método alternativo`,
              created_by: deliveredBy,
              created_at: new Date().toISOString()
            });

          if (paymentError) {
            console.warn('⚠️ [DeliveryFallbackService] Error registrando pago:', paymentError);
            // No lanzar error, continuar con otros pagos
          }
        }
      }

      console.log('🎉 [DeliveryFallbackService] Entrega completada exitosamente con método alternativo');
      return updatedPackage;

    } catch (error) {
      console.error('❌ [DeliveryFallbackService] Error en método alternativo:', error);
      throw error;
    }
  }
}

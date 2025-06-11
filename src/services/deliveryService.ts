
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

export class DeliveryService {
  static async deliverPackage({ packageId, deliveredBy, payments }: DeliverPackageParams) {
    console.log('🚀 [DeliveryService] Iniciando entrega de paquete:', {
      packageId,
      deliveredBy,
      payments,
      paymentsCount: payments?.length || 0
    });

    try {
      // Validar parámetros de entrada
      if (!packageId) {
        throw new Error('ID del paquete es requerido');
      }
      if (!deliveredBy) {
        throw new Error('Información del entregador es requerida');
      }

      console.log('✅ [DeliveryService] Parámetros validados correctamente');

      // Obtener información del paquete
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError) {
        console.error('❌ [DeliveryService] Error obteniendo paquete:', packageError);
        throw new Error('No se pudo encontrar el paquete especificado');
      }

      // Verificar que el paquete se puede entregar
      if (packageData.status === 'delivered') {
        throw new Error('Este paquete ya ha sido entregado');
      }

      console.log('📦 [DeliveryService] Paquete encontrado:', {
        tracking: packageData.tracking_number,
        status: packageData.status,
        customer: packageData.customer_id
      });

      // Actualizar el estado del paquete
      const { data: updateData, error: updateError } = await supabase
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
        console.error('❌ [DeliveryService] Error actualizando paquete:', updateError);
        throw new Error('No se pudo actualizar el estado del paquete');
      }

      console.log('✅ [DeliveryService] Paquete actualizado exitosamente');

      // Crear evento de tracking
      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert({
          package_id: packageId,
          event_type: 'delivered',
          description: `Paquete entregado por ${deliveredBy}`,
          location: packageData.destination || 'Destino',
          created_at: new Date().toISOString()
        });

      if (trackingError) {
        console.warn('⚠️ [DeliveryService] Error creando evento de tracking:', trackingError);
        // No lanzar error, es secundario
      }

      // Registrar pagos si existen
      if (payments && payments.length > 0) {
        console.log('💰 [DeliveryService] Procesando pagos:', payments.length);
        
        for (const payment of payments) {
          try {
            const { error: paymentError } = await supabase
              .from('customer_payments')
              .insert({
                package_id: packageId,
                amount: Number(payment.amount),
                currency: payment.currency,
                payment_method: payment.method_id,
                notes: `Pago registrado durante entrega - ${payment.type}`,
                created_by: deliveredBy,
                created_at: new Date().toISOString()
              });

            if (paymentError) {
              console.error('❌ [DeliveryService] Error registrando pago:', paymentError);
            } else {
              console.log('✅ [DeliveryService] Pago registrado exitosamente');
            }
          } catch (paymentError) {
            console.error('❌ [DeliveryService] Error procesando pago:', paymentError);
            // Continuar con otros pagos
          }
        }
      }

      console.log('🎉 [DeliveryService] Entrega completada exitosamente');
      return updateData;

    } catch (error) {
      console.error('❌ [DeliveryService] Error completo en entrega:', error);
      throw error;
    }
  }
}

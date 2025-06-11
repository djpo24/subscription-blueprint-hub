
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
        throw new Error('packageId es requerido');
      }
      if (!deliveredBy) {
        throw new Error('deliveredBy es requerido');
      }

      console.log('✅ [DeliveryService] Parámetros validados correctamente');

      // Como las funciones RPC no existen, usaremos actualización directa
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError) {
        console.error('❌ [DeliveryService] Error obteniendo paquete:', packageError);
        throw packageError;
      }

      // Actualizar el estado del paquete
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
        console.error('❌ [DeliveryService] Error actualizando paquete:', updateError);
        throw updateError;
      }

      // Si hay pagos, registrarlos
      if (payments && payments.length > 0) {
        for (const payment of payments) {
          const { error: paymentError } = await supabase
            .from('customer_payments')
            .insert({
              package_id: packageId,
              amount: payment.amount,
              currency: payment.currency,
              payment_method: payment.method_id,
              notes: `Pago registrado durante entrega - ${payment.type}`,
              created_by: deliveredBy
            });

          if (paymentError) {
            console.error('❌ [DeliveryService] Error registrando pago:', paymentError);
          }
        }
      }

      console.log('✅ [DeliveryService] Entrega completada exitosamente');
      return updateData;
    } catch (error) {
      console.error('❌ [DeliveryService] Error completo en entrega:', error);
      throw error;
    }
  }
}

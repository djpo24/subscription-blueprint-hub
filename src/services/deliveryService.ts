
import { supabase } from '@/integrations/supabase/client';

interface DeliveryPayment {
  method_id: string;
  amount: number;
  currency: string;
  type: 'full' | 'partial';
}

interface DeliverPackageParams {
  packageId: string;
  deliveredBy: string; // UUID del usuario
  payments?: DeliveryPayment[];
}

export class DeliveryService {
  static async deliverPackage(params: DeliverPackageParams) {
    console.log('🚀 [DeliveryService] Iniciando entrega de paquete:', params);
    
    const { packageId, deliveredBy, payments } = params;
    
    // Validaciones
    if (!packageId) {
      throw new Error('ID del paquete es requerido');
    }
    if (!deliveredBy) {
      throw new Error('Información del entregador es requerida');
    }

    try {
      // 1. Actualizar el estado del paquete a 'delivered'
      console.log('📦 [DeliveryService] Actualizando estado del paquete a delivered...');
      const { error: packageError } = await supabase
        .from('packages')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          delivered_by: deliveredBy
        })
        .eq('id', packageId);

      if (packageError) {
        console.error('❌ [DeliveryService] Error actualizando paquete:', packageError);
        throw new Error(`Error actualizando el paquete: ${packageError.message}`);
      }

      console.log('✅ [DeliveryService] Paquete actualizado exitosamente');

      // 2. Registrar los pagos si existen
      if (payments && payments.length > 0) {
        console.log('💰 [DeliveryService] Registrando pagos:', payments);
        
        for (const payment of payments) {
          if (payment.amount > 0) {
            console.log('💳 [DeliveryService] Registrando pago individual:', payment);
            
            const { error: paymentError } = await supabase
              .from('customer_payments')
              .insert({
                package_id: packageId,
                amount: payment.amount,
                payment_method: payment.method_id,
                currency: payment.currency,
                created_by: deliveredBy,
                payment_date: new Date().toISOString()
              });

            if (paymentError) {
              console.error('❌ [DeliveryService] Error registrando pago:', paymentError);
              // No hacer throw aquí para no bloquear la entrega si solo falla el pago
              console.warn('⚠️ [DeliveryService] Continuando con entrega a pesar del error en el pago');
            } else {
              console.log('✅ [DeliveryService] Pago registrado exitosamente');
            }
          }
        }
      }

      console.log('🎉 [DeliveryService] Entrega completada exitosamente');
      return { success: true, packageId, deliveredBy };

    } catch (error) {
      console.error('❌ [DeliveryService] Error en deliverPackage:', error);
      throw error;
    }
  }
}

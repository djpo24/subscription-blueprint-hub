
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

export class DeliveryFallbackService {
  static async deliverPackageWithFallback(params: DeliverPackageParams) {
    console.log('🔄 [DeliveryFallbackService] Método alternativo iniciado:', params);
    
    const { packageId, deliveredBy, payments } = params;
    
    try {
      // Método alternativo: usar RPC o función personalizada si está disponible
      // Por ahora, usar el mismo método directo pero con manejo de errores más robusto
      
      // 1. Actualizar el paquete
      console.log('📦 [DeliveryFallbackService] Actualizando paquete...');
      const packageUpdate = await supabase
        .from('packages')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          delivered_by: deliveredBy
        })
        .eq('id', packageId)
        .select();

      if (packageUpdate.error) {
        console.error('❌ [DeliveryFallbackService] Error en packageUpdate:', packageUpdate.error);
        throw packageUpdate.error;
      }

      console.log('✅ [DeliveryFallbackService] Paquete actualizado');

      // 2. Registrar pagos con método alternativo
      if (payments && payments.length > 0) {
        console.log('💰 [DeliveryFallbackService] Procesando pagos con método alternativo...');
        
        // Crear todos los pagos en una sola operación
        const paymentRecords = payments
          .filter(p => p.amount > 0)
          .map(payment => ({
            package_id: packageId,
            amount: payment.amount,
            payment_method: payment.method_id,
            currency: payment.currency,
            created_by: deliveredBy, // Ahora es UUID, no email
            payment_date: new Date().toISOString()
          }));

        if (paymentRecords.length > 0) {
          console.log('💳 [DeliveryFallbackService] Insertando pagos:', paymentRecords);
          
          const { error: paymentsError } = await supabase
            .from('customer_payments')
            .insert(paymentRecords);

          if (paymentsError) {
            console.error('❌ [DeliveryFallbackService] Error en pagos:', paymentsError);
            console.warn('⚠️ [DeliveryFallbackService] Entrega marcada pero pagos no registrados');
          } else {
            console.log('✅ [DeliveryFallbackService] Pagos registrados exitosamente');
          }
        }
      }

      console.log('🎉 [DeliveryFallbackService] Método alternativo completado');
      return { success: true, packageId, deliveredBy };

    } catch (error) {
      console.error('❌ [DeliveryFallbackService] Error en método alternativo:', error);
      throw error;
    }
  }
}

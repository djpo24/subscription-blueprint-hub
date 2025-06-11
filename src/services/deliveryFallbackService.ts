
import { supabase } from '@/integrations/supabase/client';

interface DeliveryPayment {
  method_id: string;
  amount: number;
  currency: string;
  type: 'full' | 'partial';
}

interface FallbackDeliveryParams {
  packageId: string;
  deliveredBy: string;
  payments?: DeliveryPayment[];
}

export class DeliveryFallbackService {
  static async deliverPackageWithFallback({ packageId, deliveredBy, payments }: FallbackDeliveryParams) {
    console.log('🔄 [DeliveryFallbackService] Iniciando método alternativo...');
    console.log('📋 [DeliveryFallbackService] Parámetros:', { packageId, deliveredBy, payments });
    
    try {
      // Primero obtenemos la información del paquete
      console.log('📦 [DeliveryFallbackService] Obteniendo datos del paquete...');
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('amount_to_collect, currency, status')
        .eq('id', packageId)
        .single();

      if (packageError) {
        console.error('❌ [DeliveryFallbackService] Error obteniendo datos del paquete:', packageError);
        throw packageError;
      }

      console.log('📦 [DeliveryFallbackService] Datos del paquete:', packageData);

      // Verificar que el paquete se puede entregar
      if (packageData.status === 'delivered') {
        throw new Error('El paquete ya ha sido entregado');
      }

      // Método alternativo: actualizar directamente la tabla packages
      console.log('📝 [DeliveryFallbackService] Actualizando estado del paquete...');
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
        console.error('❌ [DeliveryFallbackService] Error en actualización de paquete:', updateError);
        throw updateError;
      }

      console.log('✅ [DeliveryFallbackService] Paquete actualizado:', updateData);

      // Calcular total cobrado de los pagos
      const totalCollected = payments ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
      console.log('💰 [DeliveryFallbackService] Total cobrado:', totalCollected);
      console.log('💰 [DeliveryFallbackService] Monto a cobrar del paquete:', packageData.amount_to_collect);

      // Si hay pagos, registrarlos en customer_payments
      if (payments && payments.length > 0) {
        await this.createCustomerPayments(packageId, payments);
      }

      console.log('✅ [DeliveryFallbackService] Entrega procesada con método alternativo');
      return updateData;
    } catch (error) {
      console.error('❌ [DeliveryFallbackService] Error en método alternativo:', error);
      throw error;
    }
  }

  private static async createCustomerPayments(
    packageId: string, 
    payments: DeliveryPayment[]
  ) {
    console.log('💰 [DeliveryFallbackService] Registrando pagos en customer_payments...');
    
    try {
      // Obtener el customer_id del paquete
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('customer_id')
        .eq('id', packageId)
        .single();

      if (packageError) {
        console.error('❌ [DeliveryFallbackService] Error obteniendo customer_id:', packageError);
        return;
      }

      // Crear registros de pago en customer_payments
      for (const payment of payments) {
        console.log('💳 [DeliveryFallbackService] Creando pago:', payment);
        const { error: paymentError } = await supabase
          .from('customer_payments')
          .insert({
            package_id: packageId,
            amount: payment.amount,
            currency: payment.currency,
            payment_method: payment.method_id,
            notes: `Pago registrado durante entrega - ${payment.type}`,
            created_by: 'Sistema - Entrega'
          });

        if (paymentError) {
          console.error('❌ [DeliveryFallbackService] Error creando pago:', paymentError);
          // No lanzamos error aquí para no bloquear la entrega
        } else {
          console.log('✅ [DeliveryFallbackService] Pago creado exitosamente');
        }
      }
    } catch (error) {
      console.error('❌ [DeliveryFallbackService] Error en createCustomerPayments:', error);
      // No lanzamos error para no bloquear la entrega principal
    }
  }
}

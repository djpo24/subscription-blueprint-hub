
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

      // Preparar los pagos - convertir a formato esperado por la función RPC
      const paymentsForRpc = payments && payments.length > 0 ? payments.map(p => ({
        method_id: p.method_id,
        amount: p.amount,
        currency: p.currency, // Mantener como string, el cast se hará en la función RPC
        type: p.type
      })) : null;

      console.log('💰 [DeliveryService] Pagos preparados para RPC:', paymentsForRpc);

      // Llamar a la función RPC v2 con mejor manejo de errores
      const { data, error } = await supabase.rpc('deliver_package_with_payment_v2', {
        p_package_id: packageId,
        p_delivered_by: deliveredBy,
        p_payments: paymentsForRpc
      });
      
      if (error) {
        console.error('❌ [DeliveryService] Error en función RPC:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [DeliveryService] Respuesta exitosa de RPC:', data);
      return data;
    } catch (error) {
      console.error('❌ [DeliveryService] Error completo en entrega:', {
        error,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorStack: error?.stack
      });
      throw error;
    }
  }
}

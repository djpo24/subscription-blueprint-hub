
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
    console.log('🚀 Iniciando entrega de paquete:', {
      packageId,
      deliveredBy,
      payments
    });

    try {
      // Primero intentamos la función RPC original - CAMBIO: enviar array como JSON
      const { data, error } = await supabase.rpc('deliver_package_with_payment', {
        p_package_id: packageId,
        p_delivered_by: deliveredBy,
        p_payments: (payments || []) as any // Cast as any para evitar el error de tipos
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
  }
}

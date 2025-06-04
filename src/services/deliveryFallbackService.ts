
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

      // Si hay pagos, creamos un registro de entrega y luego los pagos
      if (payments && payments.length > 0) {
        await this.createDeliveryRecord(packageId, deliveredBy, totalCollected, payments);
      }

      // CRUCIAL: Si el paquete tiene monto a cobrar, crear registro de deuda SIEMPRE
      if (packageData.amount_to_collect && packageData.amount_to_collect > 0) {
        await this.createOrUpdateDebtRecord(packageId, packageData.amount_to_collect, totalCollected);
      } else {
        console.log('ℹ️ [DeliveryFallbackService] Paquete sin monto a cobrar, no se crea registro de deuda');
      }

      console.log('✅ [DeliveryFallbackService] Entrega procesada con método alternativo');
      return updateData;
    } catch (error) {
      console.error('❌ [DeliveryFallbackService] Error en método alternativo:', error);
      throw error;
    }
  }

  private static async createDeliveryRecord(
    packageId: string, 
    deliveredBy: string, 
    totalCollected: number, 
    payments: DeliveryPayment[]
  ) {
    console.log('💰 [DeliveryFallbackService] Creando registro de entrega y pagos...');
    
    try {
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
        console.error('❌ [DeliveryFallbackService] Error creando registro de entrega:', deliveryError);
        // No lanzamos error aquí para no bloquear la entrega del paquete
        return;
      }

      console.log('✅ [DeliveryFallbackService] Registro de entrega creado:', deliveryData);

      // Crear registros de pago
      for (const payment of payments) {
        console.log('💳 [DeliveryFallbackService] Creando pago:', payment);
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
          console.error('❌ [DeliveryFallbackService] Error creando pago:', paymentError);
          // No lanzamos error aquí para no bloquear la entrega
        } else {
          console.log('✅ [DeliveryFallbackService] Pago creado exitosamente');
        }
      }
    } catch (error) {
      console.error('❌ [DeliveryFallbackService] Error en createDeliveryRecord:', error);
      // No lanzamos error para no bloquear la entrega principal
    }
  }

  private static async createOrUpdateDebtRecord(
    packageId: string, 
    amountToCollect: number, 
    totalCollected: number
  ) {
    console.log('💸 [DeliveryFallbackService] Creando/actualizando registro de deuda...');
    
    try {
      const pendingAmount = amountToCollect - totalCollected;
      
      // Verificar si ya existe un registro de deuda
      const { data: existingDebt, error: checkError } = await supabase
        .from('package_debts')
        .select('id')
        .eq('package_id', packageId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ [DeliveryFallbackService] Error verificando deuda existente:', checkError);
      }

      if (existingDebt) {
        console.log('📝 [DeliveryFallbackService] Actualizando registro de deuda existente...');
        // Actualizar registro existente
        const { error: debtError } = await supabase
          .from('package_debts')
          .update({
            total_amount: amountToCollect,
            pending_amount: pendingAmount,
            paid_amount: totalCollected,
            debt_type: 'unpaid',
            delivery_date: new Date().toISOString(),
            status: totalCollected >= amountToCollect ? 'paid' : 
                    totalCollected > 0 ? 'partial' : 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('package_id', packageId);

        if (debtError) {
          console.error('❌ [DeliveryFallbackService] Error actualizando registro de deuda:', debtError);
        } else {
          console.log('✅ [DeliveryFallbackService] Registro de deuda actualizado exitosamente');
        }
      } else {
        console.log('📝 [DeliveryFallbackService] Creando nuevo registro de deuda...');
        // Crear nuevo registro
        const { error: debtError } = await supabase
          .from('package_debts')
          .insert({
            package_id: packageId,
            total_amount: amountToCollect,
            pending_amount: pendingAmount,
            paid_amount: totalCollected,
            debt_type: 'unpaid',
            debt_start_date: new Date().toISOString().split('T')[0], // Solo la fecha
            delivery_date: new Date().toISOString(),
            status: totalCollected >= amountToCollect ? 'paid' : 
                    totalCollected > 0 ? 'partial' : 'pending'
          });

        if (debtError) {
          console.error('❌ [DeliveryFallbackService] Error creando registro de deuda:', debtError);
        } else {
          console.log('✅ [DeliveryFallbackService] Registro de deuda creado exitosamente');
        }
      }
    } catch (error) {
      console.error('❌ [DeliveryFallbackService] Error en createOrUpdateDebtRecord:', error);
      // No lanzamos error para no bloquear la entrega principal
    }
  }
}


import { supabase } from '@/integrations/supabase/client';
import type { PaymentEntryData } from '@/types/payment';
import type { RecordPaymentCustomer } from '@/types/recordPayment';

interface SubmitPaymentParams {
  customer: RecordPaymentCustomer;
  payments: PaymentEntryData[];
  notes: string;
}

export class PaymentSubmissionService {
  static async submitPayment({ customer, payments, notes }: SubmitPaymentParams) {
    console.log('🚀 [PaymentSubmissionService] Starting payment submission:', {
      customerId: customer.id,
      paymentsCount: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
    });

    // Validate that there's at least one valid payment
    const validPayments = payments.filter(p => p.methodId && p.amount && parseFloat(p.amount) > 0);
    if (validPayments.length === 0) {
      throw new Error('Por favor ingresa al menos un pago válido');
    }

    // Get the first package ID for this customer (simplified approach)
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('status', 'delivered')
      .gt('amount_to_collect', 0)
      .limit(1);

    if (packagesError) throw packagesError;
    if (!packages || packages.length === 0) {
      throw new Error('No se encontraron paquetes para este cliente');
    }

    // Register all valid payments
    for (const payment of validPayments) {
      const { error } = await supabase
        .from('customer_payments')
        .insert({
          customer_id: customer.id,
          package_id: packages[0].id,
          amount: parseFloat(payment.amount),
          payment_method: payment.methodId === 'efectivo' ? 'efectivo' : 
                         payment.methodId === 'transferencia' ? 'transferencia' :
                         payment.methodId === 'tarjeta' ? 'tarjeta' : 'otro',
          currency: payment.currency,
          notes: notes || null,
          created_by: 'Usuario actual' // TODO: Replace with actual user
        });

      if (error) throw error;
    }

    const totalPaid = validPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    console.log('✅ [PaymentSubmissionService] Payment submission completed successfully');
    
    return {
      totalPaid,
      currency: validPayments[0].currency,
      paymentCount: validPayments.length
    };
  }
}


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

    // Get the customer ID from the package
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('customer_id')
      .eq('id', customer.id)
      .single();

    if (packageError) throw packageError;
    if (!packageData) {
      throw new Error('No se encontró el paquete especificado');
    }

    // Register all valid payments directly in customer_payments table
    for (const payment of validPayments) {
      const { error } = await supabase
        .from('customer_payments')
        .insert({
          package_id: customer.id,
          amount: parseFloat(payment.amount),
          payment_method: payment.methodId,
          currency: payment.currency,
          notes: notes || null,
          created_by: 'Usuario actual' // TODO: Replace with actual user
        });

      if (error) {
        console.error('Error registering payment:', error);
        throw error;
      }
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

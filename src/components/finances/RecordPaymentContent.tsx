
import { MobilePackageInfo } from '@/components/mobile/MobilePackageInfo';
import { PaymentFormFields } from './PaymentFormFields';
import { PaymentSummaryCard } from './PaymentSummaryCard';
import { RecordPaymentActions } from './RecordPaymentActions';
import type { PaymentEntryData } from '@/types/payment';

interface Customer {
  id: string;
  customer_name: string;
  phone: string;
  total_pending_amount: number;
  package_numbers: string;
}

interface RecordPaymentContentProps {
  customer: Customer;
  mockPackage: any;
  payments: PaymentEntryData[];
  notes: string;
  isLoading: boolean;
  onAddPayment: () => void;
  onUpdatePayment: (index: number, field: string, value: string) => void;
  onRemovePayment: (index: number) => void;
  onNotesChange: (notes: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  getCurrencySymbol: (currency: string) => string;
}

export function RecordPaymentContent({
  customer,
  mockPackage,
  payments,
  notes,
  isLoading,
  onAddPayment,
  onUpdatePayment,
  onRemovePayment,
  onNotesChange,
  onCancel,
  onSubmit,
  getCurrencySymbol
}: RecordPaymentContentProps) {
  // Calcular totales de pago
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = Math.max(0, customer.total_pending_amount - totalCollected);
  
  // Usar la divisa del paquete
  const packageCurrency = mockPackage?.currency || 'COP';
  const currencySymbol = getCurrencySymbol(packageCurrency);

  return (
    <div className="space-y-4">
      {/* Package Info - usando el componente móvil */}
      <MobilePackageInfo package={mockPackage} />

      {/* Payment Form Fields */}
      <PaymentFormFields
        mockPackage={mockPackage}
        payments={payments}
        notes={notes}
        onAddPayment={onAddPayment}
        onUpdatePayment={onUpdatePayment}
        onRemovePayment={onRemovePayment}
        onNotesChange={onNotesChange}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Payment Summary Warning */}
      <PaymentSummaryCard
        remainingAmount={remainingAmount}
        currency={packageCurrency}
        currencySymbol={currencySymbol}
      />

      {/* Action Buttons */}
      <RecordPaymentActions
        isLoading={isLoading}
        hasPayments={payments.length > 0}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
}

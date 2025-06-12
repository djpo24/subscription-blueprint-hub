import { MobilePackageInfo } from '@/components/mobile/MobilePackageInfo';
import { MobilePaymentSection } from '@/components/mobile/MobilePaymentSection';
import { MobileDeliveryFormFields } from '@/components/mobile/MobileDeliveryFormFields';
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
  console.log('🏗️ [RecordPaymentContent] Mock package:', mockPackage);
  console.log('💳 [RecordPaymentContent] Payments:', payments);
  
  // Usar la divisa del paquete - MISMA LÓGICA QUE EN EL FORMULARIO MÓVIL
  const packageCurrency = mockPackage?.currency || 'COP';
  console.log('💰 [RecordPaymentContent] Package currency:', packageCurrency);
  
  // Calcular totales de pago - MISMA LÓGICA QUE EN EL FORMULARIO MÓVIL
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = Math.max(0, customer.total_pending_amount - totalCollected);
  const currencySymbol = getCurrencySymbol(packageCurrency);

  console.log('💱 [RecordPaymentContent] Currency symbol:', currencySymbol);
  console.log('📊 [RecordPaymentContent] Total collected:', totalCollected);
  console.log('📊 [RecordPaymentContent] Remaining amount:', remainingAmount);

  // Verificar si hay al menos un pago válido - MISMA LÓGICA QUE EN EL FORMULARIO MÓVIL
  const hasValidPayments = payments.some(p => p.methodId && p.amount && parseFloat(p.amount) > 0);

  return (
    <div className="space-y-4">
      {/* Package Info - usando el componente móvil IDÉNTICO */}
      <MobilePackageInfo package={mockPackage} />

      {/* Payment Section - usando la MISMA lógica del formulario móvil */}
      <MobilePaymentSection
        package={mockPackage}
        payments={payments}
        onAddPayment={onAddPayment}
        onUpdatePayment={onUpdatePayment}
        onRemovePayment={onRemovePayment}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Delivery Form Fields - Solo notas, omitiendo "entregado por" */}
      <MobileDeliveryFormFields
        deliveredBy=""
        setDeliveredBy={() => {}}
        notes={notes}
        setNotes={onNotesChange}
        hideDeliveredBy={true}
      />

      {/* Action Buttons - usando hasValidPayments como en el formulario móvil */}
      <RecordPaymentActions
        isLoading={isLoading}
        hasPayments={hasValidPayments}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
}

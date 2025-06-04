
import { MobilePaymentSection } from '@/components/mobile/MobilePaymentSection';
import { MobileDeliveryFormFields } from '@/components/mobile/MobileDeliveryFormFields';
import type { PaymentEntryData } from '@/types/payment';

interface PaymentFormFieldsProps {
  mockPackage: any;
  payments: PaymentEntryData[];
  notes: string;
  onAddPayment: () => void;
  onUpdatePayment: (index: number, field: string, value: string) => void;
  onRemovePayment: (index: number) => void;
  onNotesChange: (notes: string) => void;
  getCurrencySymbol: (currency: string) => string;
}

export function PaymentFormFields({
  mockPackage,
  payments,
  notes,
  onAddPayment,
  onUpdatePayment,
  onRemovePayment,
  onNotesChange,
  getCurrencySymbol
}: PaymentFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Payment Section - usando el componente móvil */}
      <MobilePaymentSection
        package={mockPackage}
        payments={payments}
        onAddPayment={onAddPayment}
        onUpdatePayment={onUpdatePayment}
        onRemovePayment={onRemovePayment}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Delivery Form - Solo notas, omitiendo "entregado por" */}
      <MobileDeliveryFormFields
        deliveredBy=""
        setDeliveredBy={() => {}}
        notes={notes}
        setNotes={onNotesChange}
        hideDeliveredBy={true}
      />
    </div>
  );
}

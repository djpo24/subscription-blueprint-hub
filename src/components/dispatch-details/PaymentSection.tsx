
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { PaymentEntry } from './PaymentEntry';
import { PaymentSummary } from './PaymentSummary';

interface PaymentEntryData {
  methodId: string;
  amount: string;
  currency: string;
  type: 'full' | 'partial';
}

interface PaymentSectionProps {
  payments: PaymentEntryData[];
  onAddPayment: () => void;
  onUpdatePayment: (index: number, field: keyof PaymentEntryData, value: string) => void;
  onRemovePayment: (index: number) => void;
  packageAmountToCollect: number;
  getCurrencySymbol: (currency: string) => string;
  packageCurrency?: string; // Add package currency prop
}

export function PaymentSection({
  payments,
  onAddPayment,
  onUpdatePayment,
  onRemovePayment,
  packageAmountToCollect,
  getCurrencySymbol,
  packageCurrency
}: PaymentSectionProps) {
  return (
    <div className="space-y-4">
      {packageCurrency && (
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
          <strong>Moneda de la encomienda:</strong> {packageCurrency === 'AWG' ? 'Florín (AWG)' : 'Peso (COP)'}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <Label>Pagos recibidos</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddPayment}>
          <Plus className="h-4 w-4 mr-1" />
          Agregar otro pago
        </Button>
      </div>

      {payments.map((payment, index) => (
        <PaymentEntry
          key={index}
          payment={payment}
          index={index}
          onUpdate={onUpdatePayment}
          onRemove={onRemovePayment}
          canRemove={payments.length > 1}
        />
      ))}

      {/* Payment Summary */}
      <PaymentSummary
        payments={payments}
        packageAmountToCollect={packageAmountToCollect}
        getCurrencySymbol={getCurrencySymbol}
      />
    </div>
  );
}

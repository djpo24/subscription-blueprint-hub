
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { PaymentEntry } from '../dispatch-details/PaymentEntry';
import { PaymentSummary } from '../dispatch-details/PaymentSummary';
import type { PackageInDispatch } from '@/types/dispatch';
import type { PaymentEntryData } from '@/types/payment';

interface MobilePaymentSectionProps {
  package: PackageInDispatch;
  payments: PaymentEntryData[];
  onAddPayment: () => void;
  onUpdatePayment: (index: number, field: string, value: string) => void;
  onRemovePayment: (index: number) => void;
  getCurrencySymbol: (currency: string) => string;
}

export function MobilePaymentSection({
  package: pkg,
  payments,
  onUpdatePayment,
  getCurrencySymbol
}: MobilePaymentSectionProps) {
  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;
  
  if (!requiresPayment) return null;

  // Usar la divisa del paquete
  const packageCurrency = pkg.currency || 'COP';
  console.log('💰 [MobilePaymentSection] Package currency:', packageCurrency);
  
  // Calcular totales de pago usando la divisa del paquete
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const currencySymbol = getCurrencySymbol(packageCurrency);
  console.log('💱 [MobilePaymentSection] Currency symbol:', currencySymbol);
  
  const remainingAmount = (pkg.amount_to_collect || 0) - totalCollected;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <DollarSign className="h-5 w-5" />
          Cobro Requerido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="text-sm text-green-700">
            <strong>Total a cobrar:</strong> {currencySymbol}{pkg.amount_to_collect?.toLocaleString('es-CO')} {packageCurrency}
          </p>
          {totalCollected > 0 && (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-green-700">
                <strong>Recibido:</strong> {currencySymbol}{totalCollected.toLocaleString('es-CO')} {packageCurrency}
              </p>
              <p className={`${remainingAmount <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                <strong>Pendiente:</strong> {currencySymbol}{remainingAmount.toLocaleString('es-CO')} {packageCurrency}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-green-800">Registrar pago</Label>

          {payments.length > 0 && (
            <PaymentEntry
              payment={payments[0]}
              index={0}
              onUpdate={onUpdatePayment}
              onRemove={() => {}}
              canRemove={false}
            />
          )}

          <PaymentSummary
            payments={payments}
            packageAmountToCollect={pkg.amount_to_collect || 0}
            getCurrencySymbol={getCurrencySymbol}
          />
        </div>
      </CardContent>
    </Card>
  );
}
